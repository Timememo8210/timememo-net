# Orchestra v2 / 第二版

## 中文说明

Orchestra v2 不是一个线上 SaaS。GitHub Pages 上的页面只是说明书和静态预览；真正调用 Claude、GLM 5.1、Codex 的服务必须在本地机器运行。

如果 Mac mini 已经配好了 Claude Code、GLM 5.1 ACP、Codex，先在 Mac mini 上试用。Mac Pro 可以继续负责编辑和发布网页，不必马上重新配置 GLM 5.1。

### 推荐试用方式

最简单方式：在 Mac mini 上打开 `orchestra-v2` 文件夹，双击：

```text
Orchestra v2.app
```

它会后台启动服务并自动打开浏览器。要停止服务，双击：

```text
Stop Orchestra v2.app
```

如果你想用命令行，也可以在 Mac mini 上：

如果 Mac mini 上还没有代码，也可以先下载压缩包：

```text
https://timememo8210.github.io/sky-portal/downloads/Orchestra-v2-Mac.zip
```

解压后进入 `orchestra-v2` 文件夹，双击 `Orchestra v2.app`。如果 macOS 第一次提示来自未知开发者，右键点击 App，选择“打开”。

```bash
git clone git@github.com:Timememo8210/sky-portal.git
cd sky-portal/orchestra-v2
HOST=0.0.0.0 PORT=8420 ./start_v2.sh
```

然后：

- 在 Mac mini 本机打开 `http://127.0.0.1:8420`
- 在 Mac Pro 上打开 `http://<Mac mini 的 Tailscale 或局域网 IP>:8420`

如果你原来的 v1 Dashboard 地址 `http://100.108.145.51:8420` 指向 Mac mini，那么 v2 也可以用同样的 IP，只要 v2 服务在 Mac mini 上启动并监听 `0.0.0.0`。

### 为什么线上页面不能直接跑

`https://timememo8210.github.io/sky-portal/orchestra-v2/dashboard_v2.html` 是静态页面。它不能直接访问 Mac mini 本机的 API，也不能直接读取 Mac mini 上的 Claude / Codex / GLM 配置。

要真正运行，必须打开本地服务地址，例如：

```text
http://127.0.0.1:8420
http://100.108.145.51:8420
```

### v2 的核心变化

| 项目 | v1 | v2 |
| --- | --- | --- |
| 任务状态 | 共享 `state.json` 和上下文文件 | 只有主控写 `state.json`, `todo.md`, `memory/global.md` |
| 子 Agent 进度 | 主要看日志 | 每个 Agent 写自己的 `status.json`, `progress.ndjson`, `handoff.md` |
| Agent 沟通 | Prompt 和 git diff | 每条消息都是独立的 `mailbox/*.md` 文件 |
| 代码冲突 | Worker 可能共用一个目录 | 默认每个 Worker 一个 `git worktree` |
| 模型选择 | Opus / GLM / Codex 写死 | 运行前选择 planner、worker、reviewer 和 worker 数量 |
| Review 回流 | Review 后再重试 | Review 问题变成下一轮主控任务 |

### 运行目录结构

```text
.orchestra-v2/
  runs/
    run-20260522-204800/
      config.json
      state.json
      todo.md
      memory/global.md
      mailbox/
      agents/worker-1/
      review/
      worktrees/
      patches/
```

### 本机测试

不调用真实模型，只测试编排协议：

```bash
python3 orchestrator_v2.py --once --config CONFIG.example.json
```

把 `CONFIG.example.json` 里的 `planner_model`、`worker_model`、`reviewer_model` 改成 `noop`，就不会消耗 API。

## English

Orchestra v2 is not a hosted SaaS app. The GitHub Pages page is documentation and a static preview only. The service that calls Claude, GLM 5.1, and Codex must run on a local machine.

If the Mac mini already has Claude Code, GLM 5.1 ACP, and Codex configured, test on the Mac mini first. The Mac Pro can stay as the editing and publishing machine until you decide to configure GLM 5.1 there too.

### Recommended Test Path

Simplest path: on the Mac mini, open the `orchestra-v2` folder and double-click:

```text
Orchestra v2.app
```

It starts the service in the background and opens the browser. To stop the service, double-click:

```text
Stop Orchestra v2.app
```

Command-line path:

If the Mac mini does not have the code yet, download:

```text
https://timememo8210.github.io/sky-portal/downloads/Orchestra-v2-Mac.zip
```

Unzip it, open the `orchestra-v2` folder, and double-click `Orchestra v2.app`. If macOS blocks the unsigned app the first time, right-click it and choose Open.

```bash
git clone git@github.com:Timememo8210/sky-portal.git
cd sky-portal/orchestra-v2
HOST=0.0.0.0 PORT=8420 ./start_v2.sh
```

Then open:

- `http://127.0.0.1:8420` on the Mac mini
- `http://<Mac mini Tailscale or LAN IP>:8420` from the Mac Pro

If the old v1 dashboard address `http://100.108.145.51:8420` points to the Mac mini, v2 can use the same IP once the v2 service is running there and listening on `0.0.0.0`.

### Why the Online Page Cannot Run Agents

`https://timememo8210.github.io/sky-portal/orchestra-v2/dashboard_v2.html` is static. It cannot directly access the Mac mini local API, nor can it read Claude / Codex / GLM credentials from the Mac mini.

To run agents, open the local service instead:

```text
http://127.0.0.1:8420
http://100.108.145.51:8420
```

### What Changed

| Area | v1 | v2 |
| --- | --- | --- |
| Task state | Shared `state.json` plus context file | Coordinator-owned `state.json`, `todo.md`, `memory/global.md` |
| Worker progress | Worker logs | Per-agent `status.json`, `progress.ndjson`, `handoff.md` |
| Agent communication | Prompt context and git diff | Append-only `mailbox/*.md` files |
| Code conflicts | Workers may share one tree | One `git worktree` per worker by default |
| Model routing | Hard-coded Opus / GLM / Codex | Select planner, worker, reviewer, and worker count before running |
| Review loop | Review then retry | Review issues become next-round coordinator tasks |

## Update Log

- 2026-05-22: Added bilingual documentation, machine-selection guidance, coordinator-owned status protocol, append-only mailbox, selectable model profiles, worker count control, and worktree-first isolation.
