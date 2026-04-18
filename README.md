<div align="center">

# Mesh

**Your hardware. Your cloud. One click.**

Turn any Linux or macOS machine into a managed cloud server. Deploy services from a marketplace, get a public URL, monitor metrics live. No Cloudflare, no port forwarding, no SSH.

[Install](#install) · [How it works](#how-it-works) · [Architecture](#architecture) · [Roadmap](#roadmap) · [Contributing](./documentation/contributing.md)

</div>

---

## Why Mesh

Existing self-hosted platforms solve the wrong problem. Coolify manages one VPS and wraps Cloudflare Tunnel. Dokploy wants SSH access. CapRover treats multi-server as a bolt-on. None of them are built for fleets.

Mesh is fleet-first. One dashboard manages every machine you own. A native gRPC gateway replaces Cloudflare. A tiny Go agent opens an outbound tunnel, executes hash-approved commands, returns results. Nothing listens on your machines, nothing is exposed, nothing depends on a third party.

Three primitives run the whole system. Everything else is a script in the marketplace.

## Install

**Start the control plane:**

```bash
git clone https://github.com/onetype-ai/mesh-app
cd mesh-app
npm install
node back
```

HTTP dashboard on `:3020`, gRPC gateway on `:50000`.

**Add a server:**

```bash
curl -fsSL https://mesh.onetype.ai/install.sh | sudo bash
```

The script detects OS and architecture, prompts for the server token, installs the binary, and registers a systemd or launchd service. The agent dials the gateway, registers, and appears in the dashboard within seconds.

## How it works

Mesh has three RPCs. That is the entire agent protocol.

| RPC | Purpose |
|-----|---------|
| `agent.register` | Token handshake. Gateway finds the server record, opens a stream, marks it active. |
| `agent.exec` | Run a bash command. Returns `{stdout, stderr, code}`. Hash-gated when a passphrase is set. See [codes.md](./documentation/codes.md). |
| `agent.approve` | Add command hashes to the approved set. Gated by a passphrase that never leaves the agent. |

Everything else is a **script**. Scripts are bash recipes with metadata: target platform, output format, metrics schema, optional loop interval. Packages like Docker, Git, or NVIDIA drivers are three scripts (install / uninstall / status) plus an install condition.

When a script runs, Mesh sends the bash over the stream, parses the output against the declared schema, and merges the result into the server's flat metrics object. The dashboard renders whatever the schema describes. No hardcoded widgets.

That is the whole model. Add a new capability by writing a script. No pull request, no release, no endpoint.

## Architecture

```
┌─────────────────────────┐
│   Browser dashboard     │
│   Pages, elements, RPC  │
└───────────┬─────────────┘
            │ HTTP :3020
┌───────────▼─────────────┐        ┌─────────────────────┐
│   Mesh control plane    │◄──────►│   PostgreSQL        │
│   Node.js + OneType     │        │   mesh_* tables     │
└───────────┬─────────────┘        └─────────────────────┘
            │ gRPC :50000 (bidirectional stream)
            ▼
┌─────────────────────────┐
│   mesh-agent (Go)       │
│   systemd / launchd     │
│   Linux / macOS         │
│   amd64 / arm64         │
└─────────────────────────┘
```

**Control plane (this repo)** — Node.js backend on the OneType framework. Hosts HTTP on `:3020` and the gRPC gateway on `:50000`. PostgreSQL stores every addon.

**Agent ([mesh-agent](https://github.com/onetype-ai/mesh-agent))** — single static binary in Go. Dials the gateway, reconnects with exponential backoff, executes approved commands, gracefully shuts down on `SIGINT` and `SIGTERM`.

**Communication** — one long-lived gRPC bidirectional stream per agent. JSON envelope over `UniversalService.Stream`. Outbound only, zero ports opened on the agent machine.

## Addons

Everything is an addon. Shared definitions live in [`shared/addons/`](./shared/addons/), backend wiring in [`back/addons/`](./back/addons/), UI in [`front/addons/`](./front/addons/).

**[servers](./shared/addons/servers/addon.js)** — source of truth for the fleet. Fields include token (auto-generated 64 chars), flat `metrics` jsonb, `status`. Virtual fields `stream`, `exec`, `approve`, `intervals` hold the live gRPC connection.

**[scripts](./shared/addons/scripts/addon.js)** — bash recipes. `metrics` field declares widget schemas. `autorun` and `loop` let scripts run on every connect or on an interval. `hash` (sha256 of `bash`) is auto-computed and used for approval.

**[packages](./shared/addons/packages/addon.js)** — system-level tools. Three script references (install, uninstall, status) plus an `installed_condition` expression evaluated against the server's metrics.

**[approvals](./shared/addons/approvals/addon.js)** — audit log of passphrase-granted script hashes. One row per hash the agent has approved.

## Security

Mesh is built around a single rule: **your passphrase never leaves the agent**.

The server can propose any bash command. The agent computes its sha256 hash and rejects anything not in its approved set. Adding hashes requires the passphrase, which lives only in agent memory and is lost on restart. The control plane can never execute an arbitrary command on your machine, even if compromised.

Combined with the minimal surface (three RPCs, not two hundred endpoints), the attack surface is small enough to audit in a single sitting. Report vulnerabilities to [security.md](./documentation/security.md).

## Project status

Phase 1 (gateway and agent) is shipped. Phase 2 (services) is in progress. Public URLs, managed SSL, and load balancing are next.

This is a young project. The core works end to end, but surface polish, test coverage, and production hardening are active work. If you are building a hobby fleet, welcome. If you are depending on this in production, wait a few releases or talk to us first.

## Roadmap

**Phase 1 — Gateway.** Native gRPC tunnel, agent with systemd and launchd, exponential backoff, hash approval. ✓

**Phase 2 — Services.** Workloads (Postgres, Redis, vLLM, Ollama, n8n, …) with deploy, start, stop, destroy lifecycle. Each service is a self-contained definition. Services run as Docker containers and survive reboots.

**Phase 3 — Marketplace.** Fifty-plus service templates, public catalog, one-click deploy.

**Phase 4 — Compute marketplace.** Share idle hardware, earn passively. Verified templates only. Consumers get an API endpoint, never touch your server.

**Phase 5 — Enterprise.** SSO, audit logs, alerting, backup and restore, managed cloud control plane.

## Stack

[OneType framework](https://github.com/onetype-ai) for addons, routing, elements, HTTP and gRPC. PostgreSQL for persistence. Go for the agent. No Redis, no Nginx, no Traefik dependency. One `node back` starts everything.

## Project lead

**Dejan Tomic** — author of the OneType framework and system architect behind Mesh. [hi@iamdejan.com](mailto:hi@iamdejan.com)

## License

AGPL-3.0. See [LICENSE](./LICENSE).

You are free to self-host, fork, and modify. If you run a modified version as a network service, the AGPL requires you to publish your changes. Commercial licensing is available for teams that cannot comply with AGPL; contact the project lead.
