# Orchestra v2 Coordination Protocol

This protocol is intentionally file-based. It avoids a message queue while still
preventing concurrent edits to shared Markdown and JSON files.

## Roles

| Role | Writes | Reads |
| --- | --- | --- |
| Coordinator | `state.json`, `todo.md`, `memory/global.md`, task prompts | Everything |
| Planner | `planner/` and mailbox files | Initial task, repo summary, prior memory |
| Worker | `agents/<id>/`, unique mailbox files, code worktree | Its task, global memory, mailbox |
| Reviewer | `review/`, unique mailbox files | Patches, handoffs, state, todo |

## State Model

`state.json` is a coordinator-owned snapshot. Other agents may read it but must
not write it.

Each agent publishes its own status file:

```json
{
  "status": "running",
  "summary": "Implemented settings form",
  "progress": 60,
  "blockers": [],
  "updated_at": "2026-05-22T20:48:00-07:00"
}
```

The coordinator polls these files every `monitor_interval_seconds`, folds them
into `state.json`, and rewrites `todo.md`.

## Todo Format

`todo.md` is generated, not hand-edited by workers.

```md
# Orchestra Todo

- [x] planner: produce task graph
- [~] worker-1: implement dashboard model selectors
- [ ] worker-2: add worktree isolation
- [ ] reviewer: review patch set
```

Use `[~]` for running, `[!]` for blocked, `[x]` for done, and `[ ]` for pending.

## Mailbox

Agents communicate by creating unique files:

```text
mailbox/20260522T204812-worker-1-to-worker-2.md
mailbox/20260522T204901-reviewer-to-coordinator.md
```

Mailbox files are append-never, edit-never. To reply, create another file.

Suggested body:

```md
---
from: worker-1
to: coordinator
type: progress | blocker | question | review-issue
created_at: 2026-05-22T20:48:12-07:00
---

Short message here.
```

## Code Isolation

Default mode is `worktree`.

1. Coordinator creates one git worktree per worker.
2. Workers edit only their assigned worktree.
3. Coordinator captures `patches/<agent-id>.patch`.
4. Reviewer inspects patches plus handoff reports.
5. Coordinator applies approved patches sequentially, or creates repair tasks.

If the target directory is not a git repo, v2 falls back to `shared` mode and
marks the run with a warning. In shared mode, tasks should be file-disjoint.

## Review Loop

The reviewer reports issues in `review/status.json`:

```json
{
  "status": "needs_iteration",
  "p1": ["Settings form loses model selection on refresh"],
  "p2": ["Missing test for mailbox parsing"],
  "summary": "One blocking issue remains"
}
```

Coordinator converts P1/P2 issues into next-round tasks. Workers never decide
that a review issue is closed; the reviewer confirms it on the next pass.
