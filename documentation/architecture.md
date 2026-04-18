# Architecture

This document covers how Mesh is put together and why. If you want the product pitch, read the [README](../README.md) first.

## Shape of the system

Three processes, one long-lived gRPC stream between them, PostgreSQL as the only durable store.

```
┌────────────────────────┐    HTTP :3020
│  Browser dashboard     │─────────────────┐
└────────────────────────┘                 │
                                           ▼
┌────────────────────────┐         ┌───────────────────┐
│  PostgreSQL            │◄───────►│  Control plane    │
│  mesh_* tables         │         │  Node.js + OneType │
└────────────────────────┘         └──────┬────────────┘
                                          │ gRPC :50000
                                          │ (bidirectional stream)
                                          ▼
                                   ┌───────────────────┐
                                   │  mesh-agent       │
                                   │  Go, single binary │
                                   │  systemd / launchd │
                                   └───────────────────┘
```

The control plane and gateway live in the same Node.js process. The agent is a separate Go binary in [onetype-ai/mesh-agent](https://github.com/onetype-ai/mesh-agent). A browser talks to the control plane over HTTP. The control plane talks to agents over gRPC.

## Why three RPCs

The agent protocol has exactly three remote calls: `agent.register`, `agent.exec`, `agent.approve`. No more will be added. Everything that looks like it needs a new RPC is actually a new script in the marketplace. Response codes and their shapes live in [codes.md](./codes.md); emits and middleware in [events.md](./events.md).

**register** opens the stream. The agent presents a 64-character token. The gateway looks up the server, marks it active, wires up virtual `stream`, `exec`, and `approve` fields on the server record, and keeps the stream open.

**exec** runs bash. The gateway sends a command; the agent returns `{stdout, stderr, code}`. If the agent has a passphrase set, the command must be pre-approved by sha256 hash, or it is rejected with `401`.

**approve** adds command hashes to the approved set. The passphrase is submitted to the agent over the stream, verified locally, and the hashes are added to an in-memory allowlist. The passphrase is never stored and never leaves the agent host; it is lost on restart and must be re-entered to approve new commands.

This surface is small enough to audit in one sitting. It is also powerful enough to express everything Mesh does, because a generic bash executor with a security gate is a universal primitive.

## Why scripts, not endpoints

A naive PaaS adds a hardcoded endpoint for every operation: restart container, view logs, pull image, run migration. Each endpoint is code, and each code path is a maintenance and security liability.

Mesh makes every operation a **script**: a bash body plus metadata (target platform, output format, metrics schema, loop interval). Scripts are rows in a database. Running a script means sending its bash through `agent.exec` and parsing the result.

A new capability is a new row, not a new release. The community can publish scripts to the marketplace without touching the control plane. This is why the codebase is small and stays small as features grow.

## Data model

Everything is an **addon**: a named collection of fields with items stored in PostgreSQL. The four addons that make Mesh work are [servers](../shared/addons/servers/addon.js), [scripts](../shared/addons/scripts/addon.js), [packages](../shared/addons/packages/addon.js), and [approvals](../shared/addons/approvals/addon.js).

**servers** — fleet source of truth. Each row has a token (auto-generated, 64 chars), an IP, a flat `metrics` jsonb object, and a status. Four virtual fields (`stream`, `exec`, `approve`, `intervals`) hold the live gRPC connection and helpers. Virtuals are in-memory only; they reset on process restart.

**scripts** — bash recipes with a schema. The `metrics` field declares widgets: each widget has an `id`, a `label`, a `widget` type (`text`, `number`, `progress`, `badge`, `gauge`, `line`, `list`), a unit, and a key into the server's `metrics` jsonb. The `hash` field (sha256 of `bash`) is computed on save and used for agent-side approval. `autorun` and `loop` let a script run on every server connect and/or on a periodic interval.

**packages** — three script references (install, uninstall, status) plus an `installed_condition`: a short expression evaluated against `{metrics}` to determine whether a package is currently installed. This is why the frontend never hardcodes a list of packages.

**approvals** — audit log. One row per script hash approved on a given server, with the user who approved and a timestamp. Useful for diffing "what can this agent run" over time.

## Metrics are flat

`servers.metrics` is a flat jsonb, not a nested structure per script. Every script that emits JSON writes into shared keys on the same object. This is intentional:

- Widgets render by matching a key, so a widget does not care which script filled it.
- Multiple scripts can contribute to the same dashboard without coordinating.
- Schema migrations are free: add a new key, widgets that know about it light up.

The cost is that key names need to be globally unique within a server. We document conventions (`cpu_usage`, `ram_available`, `disk_used_percent`, …) in the marketplace; community scripts are expected to follow them.

## Security model

Mesh runs commands on other people's machines. Three invariants keep this safe.

**The passphrase never leaves the agent.** It is entered locally (via install script or `mesh-agent approve`), kept only in memory, lost on restart. The control plane cannot read it. No stream message carries it.

**Every exec is hash-gated when a passphrase is set.** The agent computes sha256 of the incoming bash. If the hash is not in the approved set, the command is rejected. A compromised control plane cannot execute arbitrary bash on an agent machine.

**Approvals require the passphrase.** To add a hash to the allowlist, the caller must present the passphrase. The agent verifies locally. There is no remote override.

The surface beyond this model is small: three RPCs, one JSON envelope, a handful of HTTP endpoints for the dashboard. Compare to a monolithic PaaS exposing two hundred endpoints, each of which needs its own validation, its own permission check, and its own CVE backlog.

## Process lifecycle

**Start.** `node back` binds HTTP on `:3020` and gRPC on `:50000`. PostgreSQL addons hydrate into memory. The `@servers.http.start` event fires; global scripts with `autorun` are loaded but not yet scheduled (no agents yet).

**Agent connect.** Agent dials the gateway, sends `agent.register` with its token. Gateway finds the server row, sets virtuals, inserts the server into the runtime addon collection, fires `ItemOn('add')`. Listeners (e.g. the scripts addon) iterate global `autorun` scripts and run them once. Scripts with `loop` set spawn a `setInterval`. Intervals are tracked in the server's `intervals` virtual.

**Agent disconnect.** Stream closes. Gateway clears intervals, marks the server `Inactive` in the database, and removes it from the runtime addon. No grace period; the UI reflects the disconnect immediately.

**Agent reconnect.** The agent uses exponential backoff (1s → 5min cap, infinite retries). On successful register, the backoff resets to the initial value. A reconnecting agent is treated as a fresh connect; prior intervals were cleared on disconnect.

**Shutdown.** `SIGINT` or `SIGTERM` triggers a graceful close. The agent sends an end-of-stream, the gateway marks the server `Inactive`, listeners clean up, and the process exits.

## Extending the system

To add a new capability, ask yourself whether it fits as a script. Almost always, yes.

- A new package to install? Three scripts (install, uninstall, status), one `installed_condition`. No code.
- A new metric on the dashboard? A script that emits JSON plus a `metrics` schema entry. The widget renders automatically.
- A new operation on a running service (restart, backup, rotate log)? A script.

You only write control plane code when you need a new **primitive**: a new kind of connection, a new storage model, a new security rule. Those changes should be rare and discussed in an issue first.

## What the control plane does not do

- It does not execute bash directly. The agent does.
- It does not hold the passphrase.
- It does not expose a general-purpose command runner to the dashboard. Running a script is always an `agent.exec` mediated by the approval check.
- It does not depend on Redis, Nginx, Traefik, or Cloudflare. One process, one database, one binary on the other side.

## What is next

Phase 2 is the **services** addon: long-running workloads (Postgres, Redis, vLLM, Ollama, n8n) with deploy / start / stop / destroy lifecycle, running as Docker containers, surviving agent reboots. Services are the product surface the marketplace will populate. They follow the same rule as everything else: a service is a set of scripts plus metadata.

Phase 3 is the **public gateway**: `service-id.mesh.onetype.ai` URLs, managed SSL, round-robin load balancing across instances of a service. This is the piece of Mesh that is meaningfully hard to self-host, and it will be the first paid tier.

Both are built on the primitives that exist today. No new RPCs planned.
