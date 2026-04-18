# Security Policy

Mesh runs bash commands on other people's machines. We take this seriously.

## Reporting a vulnerability

If you find a security issue, please report it privately to **security@onetype.ai**. Do not open a public GitHub issue, and do not disclose the details before we have had a chance to respond.

A good report includes:

- Which component is affected (control plane, gateway, agent, web dashboard).
- The exact version or commit.
- A minimal proof of concept, if you have one.
- What an attacker could achieve by exploiting the issue.

We will acknowledge your report within 48 hours, keep you informed of progress, and credit you in the release notes unless you prefer to stay anonymous.

## Supported versions

Mesh is pre-1.0 and moves fast. We currently patch only the latest release. Once we reach 1.0, we will publish a formal support window.

## Design rules that shape the threat model

A few invariants are core to how Mesh handles security. If you find anything that appears to break these, treat it as a vulnerability and report it.

**The passphrase never leaves the agent.** It lives only in agent memory, is lost on restart, and is never written to disk or sent over the wire. The control plane cannot read it, and no stream message carries it.

**Every exec is hash-gated when a passphrase is set.** The agent computes the sha256 of the incoming bash and rejects anything not in its approved set. A compromised gateway cannot execute arbitrary commands on an agent machine.

**Approval requires the passphrase at the edge.** Adding hashes to the approved set requires the passphrase to be submitted to the agent directly. Approvals cannot be forged from the control plane.

**Agents speak outbound only.** The agent dials the gateway. Nothing listens on the agent host. There are no ports to scan, no inbound firewall rules to misconfigure.

**Team isolation.** Every record carries `team_id`. Cross-team access is a bug, not a feature.

## Scope

In scope:

- The control plane ([this repo](https://github.com/onetype-ai/mesh-app)).
- The agent ([onetype-ai/mesh-agent](https://github.com/onetype-ai/mesh-agent)).
- The install script served from `mesh.onetype.ai/install.sh`.
- The hosted gateway and dashboard at `mesh.onetype.ai`.

Out of scope:

- Services deployed by users via Mesh. Those are user workloads; report vulnerabilities to the respective projects.
- Denial of service from a compromised agent that the server owner already controls.
- Physical access to a machine running the agent.

## Safe harbor

We will not pursue legal action against researchers who follow this policy in good faith. If you are unsure whether a specific action is in scope, ask before testing.
