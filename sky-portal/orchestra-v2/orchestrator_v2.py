#!/usr/bin/env python3
from __future__ import annotations

import argparse
import dataclasses
import datetime as dt
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse


APP_DIR = Path(__file__).resolve().parent

ACP_ENV = {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.1",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
}

MODEL_PROFILES: dict[str, dict[str, Any]] = {
    "opus": {
        "label": "Claude Opus",
        "role_hint": "best for architecture and planning",
        "command": ["claude", "-p", "--model", "opus"],
        "env": {},
    },
    "sonnet": {
        "label": "Claude Sonnet",
        "role_hint": "balanced planning or execution",
        "command": ["claude", "-p", "--model", "sonnet"],
        "env": {},
    },
    "glm-5.1": {
        "label": "GLM 5.1 via ACP",
        "role_hint": "low-cost parallel execution",
        "command": ["claude", "-p"],
        "env": ACP_ENV,
    },
    "codex": {
        "label": "Codex",
        "role_hint": "review and implementation",
        "command": ["codex", "exec", "--skip-git-repo-check"],
        "env": {},
    },
    "codex-all-apps": {
        "label": "Codex all-apps profile",
        "role_hint": "Codex profile for app/tool-heavy tasks",
        "command": ["codex", "exec", "--profile", "all-apps", "--skip-git-repo-check"],
        "env": {},
    },
    "noop": {
        "label": "No-op simulator",
        "role_hint": "test the orchestration protocol without model calls",
        "command": [],
        "env": {},
        "simulated": True,
    },
}


def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def compact_ts() -> str:
    return dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    tmp = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            tmp.unlink()


def atomic_write_json(path: Path, payload: Any) -> None:
    atomic_write_text(path, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def load_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def resolve_path(value: str | Path, base: Path | None = None) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = (base or Path.cwd()) / path
    return path.resolve()


def is_git_repo(path: Path) -> bool:
    try:
        result = subprocess.run(
            ["git", "-C", str(path), "rev-parse", "--is-inside-work-tree"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        return result.stdout.strip() == "true"
    except FileNotFoundError:
        return False


@dataclasses.dataclass
class RunConfig:
    task: str
    target_dir: str
    planner_model: str = "opus"
    worker_model: str = "glm-5.1"
    worker_models: list[str] = dataclasses.field(default_factory=list)
    reviewer_model: str = "codex"
    worker_count: int = 4
    monitor_interval_seconds: int = 20
    max_rounds: int = 3
    isolation: str = "worktree"
    runtime_dir: str = ".orchestra-v2"

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "RunConfig":
        worker_count = int(payload.get("worker_count") or 4)
        worker_count = max(1, min(worker_count, 12))
        monitor_interval = int(payload.get("monitor_interval_seconds") or 20)
        monitor_interval = max(2, min(monitor_interval, 300))
        max_rounds = int(payload.get("max_rounds") or 3)
        max_rounds = max(1, min(max_rounds, 10))
        isolation = payload.get("isolation") or "worktree"
        if isolation not in {"worktree", "shared"}:
            isolation = "worktree"

        worker_models = payload.get("worker_models") or []
        if isinstance(worker_models, str):
            worker_models = [item.strip() for item in worker_models.split(",") if item.strip()]
        if not isinstance(worker_models, list):
            worker_models = []

        return cls(
            task=str(payload.get("task") or "").strip(),
            target_dir=str(payload.get("target_dir") or ".").strip(),
            planner_model=str(payload.get("planner_model") or "opus"),
            worker_model=str(payload.get("worker_model") or "glm-5.1"),
            worker_models=[str(item) for item in worker_models],
            reviewer_model=str(payload.get("reviewer_model") or "codex"),
            worker_count=worker_count,
            monitor_interval_seconds=monitor_interval,
            max_rounds=max_rounds,
            isolation=isolation,
            runtime_dir=str(payload.get("runtime_dir") or ".orchestra-v2"),
        )


class RunStore:
    def __init__(self, run_dir: Path, run_id: str, config: RunConfig) -> None:
        self.run_dir = run_dir
        self.run_id = run_id
        self.config = config
        self.lock = threading.RLock()
        self.seen_mailbox: set[str] = set()
        self.state: dict[str, Any] = {
            "run_id": run_id,
            "status": "starting",
            "phase": "init",
            "started_at": now_iso(),
            "updated_at": now_iso(),
            "config": dataclasses.asdict(config),
            "agents": {},
            "review": {},
            "mailbox": [],
            "warnings": [],
            "logs": [],
        }
        self._init_layout()

    def _init_layout(self) -> None:
        for name in ("agents", "planner", "review", "mailbox", "memory", "worktrees", "patches"):
            (self.run_dir / name).mkdir(parents=True, exist_ok=True)
        atomic_write_json(self.run_dir / "config.json", dataclasses.asdict(self.config))
        atomic_write_text(
            self.run_dir / "memory" / "global.md",
            f"# Global Memory\n\nRun: `{self.run_id}`\nCreated: {now_iso()}\n\n",
        )
        self.write_state()
        self.write_todo()

    def write_state(self) -> None:
        with self.lock:
            self.state["updated_at"] = now_iso()
            atomic_write_json(self.run_dir / "state.json", self.state)

    def set_phase(self, phase: str, status: str | None = None) -> None:
        with self.lock:
            self.state["phase"] = phase
            if status:
                self.state["status"] = status
            self.log(f"phase={phase}")
            self.write_state()
            self.write_todo()

    def log(self, message: str) -> None:
        with self.lock:
            self.state["logs"].append({"at": now_iso(), "message": message})
            self.state["logs"] = self.state["logs"][-200:]

    def warn(self, message: str) -> None:
        with self.lock:
            self.state["warnings"].append({"at": now_iso(), "message": message})
            self.log(f"warning: {message}")
            self.write_state()

    def register_agent(self, agent_id: str, role: str, model: str, task: str, workdir: Path) -> None:
        agent_dir = self.run_dir / "agents" / agent_id
        agent_dir.mkdir(parents=True, exist_ok=True)
        atomic_write_text(agent_dir / "task.md", task)
        atomic_write_text(agent_dir / "workdir.txt", str(workdir) + "\n")
        status = {
            "status": "queued",
            "summary": "",
            "progress": 0,
            "blockers": [],
            "updated_at": now_iso(),
        }
        atomic_write_json(agent_dir / "status.json", status)
        with self.lock:
            self.state["agents"][agent_id] = {
                "id": agent_id,
                "role": role,
                "model": model,
                "task": task,
                "workdir": str(workdir),
                **status,
            }
            self.write_state()
            self.write_todo()

    def update_agent(self, agent_id: str, **updates: Any) -> None:
        with self.lock:
            agent = self.state["agents"].setdefault(agent_id, {"id": agent_id})
            agent.update(updates)
            agent["updated_at"] = now_iso()
            self.write_state()
            self.write_todo()

    def update_review(self, **updates: Any) -> None:
        with self.lock:
            self.state["review"].update(updates)
            self.state["review"]["updated_at"] = now_iso()
            self.write_state()
            self.write_todo()

    def refresh_agent_reports(self) -> None:
        agents_dir = self.run_dir / "agents"
        for status_path in agents_dir.glob("*/status.json"):
            agent_id = status_path.parent.name
            status = load_json(status_path, {})
            if isinstance(status, dict):
                self.update_agent(agent_id, **status)

        mailbox_dir = self.run_dir / "mailbox"
        new_messages = []
        for msg_path in sorted(mailbox_dir.glob("*.md")):
            if msg_path.name in self.seen_mailbox:
                continue
            self.seen_mailbox.add(msg_path.name)
            text = msg_path.read_text(encoding="utf-8", errors="replace")
            preview = " ".join(text.strip().split())[:220]
            new_messages.append({"file": msg_path.name, "preview": preview, "at": now_iso()})

        if new_messages:
            with self.lock:
                self.state["mailbox"].extend(new_messages)
                self.state["mailbox"] = self.state["mailbox"][-200:]
                memory_path = self.run_dir / "memory" / "global.md"
                current = memory_path.read_text(encoding="utf-8")
                additions = "\n".join(
                    f"- {item['at']} `{item['file']}`: {item['preview']}" for item in new_messages
                )
                atomic_write_text(memory_path, current + "\n## Mailbox Rollup\n\n" + additions + "\n")
                self.write_state()

    def write_todo(self) -> None:
        with self.lock:
            lines = [
                "# Orchestra Todo",
                "",
                f"Run: `{self.run_id}`",
                f"Phase: `{self.state.get('phase')}`",
                "",
            ]
            phase = self.state.get("phase")
            planner_mark = "[x]" if phase not in {"init", "planning"} else "[~]" if phase == "planning" else "[ ]"
            lines.append(f"- {planner_mark} planner: produce task graph")
            for agent in self.state.get("agents", {}).values():
                mark = self._mark(agent.get("status", "pending"))
                lines.append(f"- {mark} {agent.get('id')}: {agent.get('task', '').splitlines()[0][:120]}")
            review_status = self.state.get("review", {}).get("status", "pending")
            review_mark = self._mark(review_status)
            lines.append(f"- {review_mark} reviewer: inspect patches and handoffs")
            lines.append("")
            lines.append("Generated by coordinator. Workers must not edit this file.")
            atomic_write_text(self.run_dir / "todo.md", "\n".join(lines) + "\n")

    @staticmethod
    def _mark(status: str) -> str:
        if status in {"done", "passed", "complete"}:
            return "[x]"
        if status in {"running", "reviewing", "planning"}:
            return "[~]"
        if status in {"blocked", "failed", "needs_iteration"}:
            return "[!]"
        return "[ ]"

    def snapshot(self) -> dict[str, Any]:
        with self.lock:
            return json.loads(json.dumps(self.state, ensure_ascii=False))


class Coordinator:
    def __init__(self, default_runtime_dir: Path) -> None:
        self.default_runtime_dir = default_runtime_dir
        self.lock = threading.RLock()
        self.current_store: RunStore | None = None
        self.current_thread: threading.Thread | None = None
        self.stop_event = threading.Event()
        self.last_state: dict[str, Any] = {
            "status": "idle",
            "phase": "idle",
            "updated_at": now_iso(),
            "agents": {},
            "review": {},
            "warnings": [],
            "logs": [],
        }

    def start(self, payload: dict[str, Any]) -> dict[str, Any]:
        config = RunConfig.from_payload(payload)
        if not config.task:
            raise ValueError("task is required")

        target_dir = resolve_path(config.target_dir)
        if not target_dir.exists():
            raise ValueError(f"target_dir does not exist: {target_dir}")
        config.target_dir = str(target_dir)

        runtime_root = resolve_path(config.runtime_dir, APP_DIR)
        run_id = f"run-{compact_ts()}"
        run_dir = runtime_root / "runs" / run_id
        store = RunStore(run_dir, run_id, config)

        with self.lock:
            if self.current_thread and self.current_thread.is_alive():
                raise RuntimeError("a run is already active")
            self.stop_event.clear()
            self.current_store = store
            self.current_thread = threading.Thread(
                target=self._run_pipeline,
                args=(store,),
                name=f"orchestra-{run_id}",
                daemon=True,
            )
            self.current_thread.start()
        return store.snapshot()

    def stop(self) -> dict[str, Any]:
        self.stop_event.set()
        store = self.current_store
        if store:
            store.set_phase("stopping", "stopping")
            return store.snapshot()
        return self.last_state

    def state(self) -> dict[str, Any]:
        store = self.current_store
        if store:
            state = store.snapshot()
            self.last_state = state
            return state
        return self.last_state

    def _run_pipeline(self, store: RunStore) -> None:
        config = store.config
        try:
            store.set_phase("planning", "running")
            plan_output = self._run_planner(store)
            tasks = self._tasks_from_plan(plan_output, config)
            current_tasks = tasks

            for round_no in range(1, config.max_rounds + 1):
                if self.stop_event.is_set():
                    store.set_phase("stopped", "stopped")
                    return

                store.set_phase(f"execute-round-{round_no}", "running")
                agent_threads = []
                for index, task in enumerate(current_tasks, start=1):
                    agent_id = f"r{round_no}-worker-{index}"
                    model = self._worker_model_for(config, index - 1)
                    workdir = self._prepare_workdir(store, agent_id)
                    store.register_agent(agent_id, "worker", model, task, workdir)
                    thread = threading.Thread(
                        target=self._run_worker,
                        args=(store, agent_id, model, task, workdir, round_no),
                        name=agent_id,
                        daemon=True,
                    )
                    agent_threads.append(thread)
                    thread.start()

                self._monitor_workers(store, agent_threads)
                self._collect_all_patches(store)

                if self.stop_event.is_set():
                    store.set_phase("stopped", "stopped")
                    return

                store.set_phase(f"review-round-{round_no}", "reviewing")
                review = self._run_reviewer(store, round_no)
                if review.get("status") == "passed":
                    store.set_phase("complete", "complete")
                    return

                issues = review.get("p1", []) + review.get("p2", [])
                if not issues:
                    store.set_phase("complete", "complete")
                    return

                current_tasks = [
                    f"Fix review issue from round {round_no}: {issue}" for issue in issues[: config.worker_count]
                ]
                while len(current_tasks) < config.worker_count:
                    current_tasks.append(
                        f"Follow up on reviewer feedback from round {round_no}; verify no regressions."
                    )

            store.set_phase("max-rounds-reached", "needs_attention")
        except Exception as exc:  # The coordinator should fail visibly, not silently.
            store.warn(f"coordinator failed: {exc}")
            store.set_phase("failed", "failed")
        finally:
            store.refresh_agent_reports()
            self.last_state = store.snapshot()

    def _run_planner(self, store: RunStore) -> str:
        config = store.config
        planner_dir = store.run_dir / "planner"
        planner_dir.mkdir(parents=True, exist_ok=True)
        prompt = f"""You are the planning agent for Orchestra v2.

Create a JSON plan for the task below. Return JSON with:
- shared_context: string
- tasks: array of {{"title": "...", "details": "..."}}

Task:
{config.task}

Target directory:
{config.target_dir}

Worker count:
{config.worker_count}
"""
        atomic_write_text(planner_dir / "prompt.md", prompt)
        output = self._invoke_profile(config.planner_model, prompt, Path(config.target_dir), planner_dir)
        atomic_write_text(planner_dir / "output.txt", output)
        return output

    def _tasks_from_plan(self, plan_output: str, config: RunConfig) -> list[str]:
        parsed = self._extract_json(plan_output)
        tasks: list[str] = []
        if isinstance(parsed, dict):
            raw_tasks = parsed.get("tasks") or []
            for item in raw_tasks:
                if isinstance(item, dict):
                    title = str(item.get("title") or "Untitled task")
                    details = str(item.get("details") or "")
                    tasks.append(f"# {title}\n\n{details}".strip())
                elif isinstance(item, str):
                    tasks.append(item)

        if not tasks:
            tasks = [
                f"Workstream {index}: implement one independent part of this task:\n\n{config.task}"
                for index in range(1, config.worker_count + 1)
            ]

        while len(tasks) < config.worker_count:
            tasks.append(f"Support and test the main task:\n\n{config.task}")
        return tasks[: config.worker_count]

    def _worker_model_for(self, config: RunConfig, index: int) -> str:
        if index < len(config.worker_models) and config.worker_models[index]:
            return config.worker_models[index]
        return config.worker_model

    def _prepare_workdir(self, store: RunStore, agent_id: str) -> Path:
        config = store.config
        target = Path(config.target_dir)
        if config.isolation != "worktree":
            return target

        if not is_git_repo(target):
            store.warn("target_dir is not a git repo; falling back to shared mode")
            return target

        worktree_parent = self._worktree_parent(store, target)
        worktree_dir = worktree_parent / agent_id
        worktree_dir.parent.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(
            ["git", "-C", str(target), "worktree", "add", "--detach", str(worktree_dir), "HEAD"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode != 0:
            store.warn(f"could not create worktree for {agent_id}: {result.stderr.strip()}")
            return target
        return worktree_dir

    def _worktree_parent(self, store: RunStore, target: Path) -> Path:
        candidate = (store.run_dir / "worktrees").resolve()
        try:
            if candidate.is_relative_to(target.resolve()):
                return (target.resolve().parent / ".orchestra-v2-worktrees" / store.run_id).resolve()
        except ValueError:
            pass
        return candidate

    def _run_worker(
        self,
        store: RunStore,
        agent_id: str,
        model: str,
        task: str,
        workdir: Path,
        round_no: int,
    ) -> None:
        agent_dir = store.run_dir / "agents" / agent_id
        store.update_agent(agent_id, status="running", progress=5, summary="started")
        prompt = self._worker_prompt(store, agent_id, task, workdir, round_no)
        atomic_write_text(agent_dir / "prompt.md", prompt)
        try:
            output = self._invoke_profile(model, prompt, workdir, agent_dir)
            atomic_write_text(agent_dir / "output.txt", output)
            self._ensure_agent_handoff(agent_dir, output)
            self._ensure_agent_status(agent_dir, "done", "completed", 100)
            store.update_agent(agent_id, status="done", progress=100, summary="completed")
        except Exception as exc:
            self._ensure_agent_status(agent_dir, "failed", str(exc), 100, blockers=[str(exc)])
            store.update_agent(agent_id, status="failed", progress=100, summary=str(exc), blockers=[str(exc)])

    def _worker_prompt(self, store: RunStore, agent_id: str, task: str, workdir: Path, round_no: int) -> str:
        rel_agent_dir = store.run_dir / "agents" / agent_id
        return f"""You are Orchestra worker {agent_id} in round {round_no}.

Assigned task:
{task}

Working directory:
{workdir}

Coordination rules:
- Do not edit {store.run_dir / "state.json"}.
- Do not edit {store.run_dir / "todo.md"}.
- Do not edit {store.run_dir / "memory" / "global.md"}.
- Write progress only to {rel_agent_dir / "progress.ndjson"}.
- Write final status JSON to {rel_agent_dir / "status.json"}.
- Write final handoff notes to {rel_agent_dir / "handoff.md"}.
- To message another agent or the coordinator, create a new Markdown file in {store.run_dir / "mailbox"}.
- Do not append to an existing mailbox file.

Status JSON schema:
{{"status":"running|done|blocked|failed","summary":"...","progress":0,"blockers":[],"updated_at":"..."}}
"""

    def _monitor_workers(self, store: RunStore, threads: list[threading.Thread]) -> None:
        interval = max(2, store.config.monitor_interval_seconds)
        while any(thread.is_alive() for thread in threads):
            if self.stop_event.is_set():
                store.warn("stop requested; waiting for active worker processes to return")
                break
            store.refresh_agent_reports()
            for _ in range(interval):
                if self.stop_event.is_set() or not any(thread.is_alive() for thread in threads):
                    break
                time.sleep(1)
        for thread in threads:
            thread.join(timeout=1)
        store.refresh_agent_reports()

    def _collect_all_patches(self, store: RunStore) -> None:
        for agent in store.snapshot().get("agents", {}).values():
            workdir = Path(agent.get("workdir") or "")
            agent_id = agent.get("id")
            if agent_id:
                self._collect_patch(store, agent_id, workdir)

    def _collect_patch(self, store: RunStore, agent_id: str, workdir: Path) -> None:
        target = Path(store.config.target_dir)
        if workdir == target or not is_git_repo(workdir):
            return
        status = subprocess.run(
            ["git", "-C", str(workdir), "status", "--short"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        diff = subprocess.run(
            ["git", "-C", str(workdir), "diff", "--binary", "HEAD"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        patch_dir = store.run_dir / "patches"
        atomic_write_text(patch_dir / f"{agent_id}.status.txt", status.stdout + status.stderr)
        if diff.stdout:
            atomic_write_text(patch_dir / f"{agent_id}.patch", diff.stdout)

    def _run_reviewer(self, store: RunStore, round_no: int) -> dict[str, Any]:
        review_dir = store.run_dir / "review"
        review_dir.mkdir(parents=True, exist_ok=True)
        store.update_review(status="reviewing", round=round_no)
        prompt = self._review_prompt(store, round_no)
        atomic_write_text(review_dir / f"prompt-round-{round_no}.md", prompt)
        try:
            output = self._invoke_profile(store.config.reviewer_model, prompt, Path(store.config.target_dir), review_dir)
            atomic_write_text(review_dir / f"review-round-{round_no}.md", output)
            parsed = self._extract_json(output)
            if not isinstance(parsed, dict):
                parsed = {"status": "passed", "summary": output[:500], "p1": [], "p2": []}
            status = parsed.get("status") or "passed"
            if status not in {"passed", "needs_iteration", "failed"}:
                status = "needs_iteration" if parsed.get("p1") or parsed.get("p2") else "passed"
            parsed["status"] = status
            atomic_write_json(review_dir / "status.json", parsed)
            store.update_review(**parsed)
            return parsed
        except Exception as exc:
            parsed = {"status": "failed", "summary": str(exc), "p1": [str(exc)], "p2": []}
            atomic_write_json(review_dir / "status.json", parsed)
            store.update_review(**parsed)
            return parsed

    def _review_prompt(self, store: RunStore, round_no: int) -> str:
        state = json.dumps(store.snapshot(), ensure_ascii=False, indent=2)
        patch_files = sorted((store.run_dir / "patches").glob("*.patch"))
        patch_list = "\n".join(f"- {path}" for path in patch_files) or "- No patch files found"
        return f"""You are the Orchestra reviewer for round {round_no}.

Review worker handoffs, patches, and the todo state. Return JSON:
{{
  "status": "passed|needs_iteration",
  "summary": "...",
  "p1": [],
  "p2": []
}}

Run state:
{state}

Patch files:
{patch_list}

Rules:
- P1 means the coordinator must create another worker round.
- P2 means another round is preferred unless the issue is clearly non-blocking.
- Write any detailed notes into the review directory only.
"""

    def _invoke_profile(self, model: str, prompt: str, cwd: Path, artifact_dir: Path) -> str:
        profile = MODEL_PROFILES.get(model)
        if not profile:
            raise ValueError(f"unknown model profile: {model}")
        if profile.get("simulated"):
            return self._simulate_response(model, prompt, artifact_dir)

        command = profile.get("command") or []
        executable = shutil.which(command[0]) if command else None
        if not executable:
            raise FileNotFoundError(f"command not found for profile {model}: {command[0] if command else model}")

        env = os.environ.copy()
        env.update(profile.get("env") or {})
        result = subprocess.run(
            command,
            input=prompt,
            cwd=str(cwd),
            env=env,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        atomic_write_text(artifact_dir / "stderr.txt", result.stderr)
        if result.returncode != 0:
            raise RuntimeError(f"{model} exited {result.returncode}: {result.stderr.strip()}")
        return result.stdout.strip()

    def _simulate_response(self, model: str, prompt: str, artifact_dir: Path) -> str:
        if "Return JSON with:" in prompt and "tasks:" in prompt:
            payload = {
                "shared_context": "Simulated plan generated by noop.",
                "tasks": [
                    {"title": "Protocol", "details": "Implement file ownership and mailbox rules."},
                    {"title": "Dashboard", "details": "Expose model and worker-count controls."},
                    {"title": "Isolation", "details": "Use worktrees or mark shared-mode warnings."},
                    {"title": "Review", "details": "Turn review findings into next-round tasks."},
                ],
            }
            return json.dumps(payload, ensure_ascii=False, indent=2)
        if "Return JSON:" in prompt and "passed|needs_iteration" in prompt:
            return json.dumps(
                {"status": "passed", "summary": "No-op review passed.", "p1": [], "p2": []},
                ensure_ascii=False,
                indent=2,
            )
        atomic_write_text(
            artifact_dir / "handoff.md",
            f"# Handoff\n\nSimulated `{model}` run completed at {now_iso()}.\n",
        )
        return "Simulated worker completed."

    @staticmethod
    def _extract_json(text: str) -> Any:
        stripped = text.strip()
        if not stripped:
            return None
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            pass

        start = stripped.find("{")
        end = stripped.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(stripped[start : end + 1])
            except json.JSONDecodeError:
                return None
        return None

    @staticmethod
    def _ensure_agent_status(
        agent_dir: Path,
        status: str,
        summary: str,
        progress: int,
        blockers: list[str] | None = None,
    ) -> None:
        status_path = agent_dir / "status.json"
        current = load_json(status_path, {})
        if current.get("status") in {"done", "blocked", "failed"} and current.get("summary"):
            return
        payload = {
            "status": status,
            "summary": summary,
            "progress": progress,
            "blockers": blockers or [],
            "updated_at": now_iso(),
        }
        atomic_write_json(status_path, payload)

    @staticmethod
    def _ensure_agent_handoff(agent_dir: Path, output: str) -> None:
        handoff = agent_dir / "handoff.md"
        if handoff.exists():
            return
        atomic_write_text(handoff, f"# Handoff\n\n{output}\n")


class OrchestraHandler(BaseHTTPRequestHandler):
    coordinator: Coordinator

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path in {"/", "/dashboard_v2.html"}:
            self._send_file(APP_DIR / "dashboard_v2.html", "text/html; charset=utf-8")
            return
        if path == "/api/models":
            self._send_json({"models": MODEL_PROFILES})
            return
        if path == "/api/state":
            self._send_json(self.coordinator.state())
            return
        if path == "/api/protocol":
            self._send_file(APP_DIR / "ORCHESTRATION_PROTOCOL.md", "text/markdown; charset=utf-8")
            return
        self.send_error(404)

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        try:
            if path == "/api/start":
                payload = self._read_json()
                state = self.coordinator.start(payload)
                self._send_json(state)
                return
            if path == "/api/stop":
                self._send_json(self.coordinator.stop())
                return
            self.send_error(404)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=400)

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"{self.address_string()} - {fmt % args}")

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("content-length") or "0")
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        return json.loads(raw or "{}")

    def _send_json(self, payload: Any, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: Path, content_type: str) -> None:
        if not path.exists():
            self.send_error(404)
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("content-type", content_type)
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run_once(config_path: Path) -> dict[str, Any]:
    payload = load_json(config_path, {})
    coordinator = Coordinator(APP_DIR / ".orchestra-v2")
    state = coordinator.start(payload)
    while coordinator.current_thread and coordinator.current_thread.is_alive():
        time.sleep(0.5)
    return coordinator.state() or state


def main() -> None:
    parser = argparse.ArgumentParser(description="Orchestra v2 coordinator")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8420)
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--config", default="CONFIG.example.json")
    args = parser.parse_args()

    if args.once:
        final_state = run_once(resolve_path(args.config, APP_DIR))
        print(json.dumps(final_state, ensure_ascii=False, indent=2))
        return

    OrchestraHandler.coordinator = Coordinator(APP_DIR / ".orchestra-v2")
    server = ThreadingHTTPServer((args.host, args.port), OrchestraHandler)
    print(f"Orchestra v2 dashboard: http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Orchestra v2")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
