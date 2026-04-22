# Mesh — Launch Checklist

Single source of truth for everything that needs to land before the public launch (OSS + marketing push).
Tick the box as you complete. Keep items in priority order within each section.

---

## 🔴 Blockers — cannot launch without these

### 1. Gateway: on-demand SSL termination
- [ ] HTTP server on `:80` + HTTPS on `:443` listening for public traffic
- [ ] Per-service hostname routing: `<service-id>.mesh.onetype.ai` → resolve agent + service + route to running container on that server
- [ ] Let's Encrypt integration (auto-provision cert on first hit for a new hostname, auto-renew)
- [ ] Cache issued certs per hostname so cold-start latency stays low after first request
- [ ] Graceful fallback when agent is offline (`502` page, not a TCP reset)
- [ ] Gateway health/status endpoint for monitoring
- [ ] Wildcard DNS `*.mesh.onetype.ai` pointing to the gateway box in production
- **Effort:** 1-2 days
- **Why blocker:** without this the whole "deploy service → get public URL" story doesn't exist. Half the product is gated behind this.

### 2. Agent binary release pipeline
- [ ] GitHub Actions workflow on `mesh-agent` repo that triggers on tag push (`v*`)
- [ ] Cross-compile for: `linux/amd64`, `linux/arm64`, `darwin/amd64`, `darwin/arm64`
- [ ] Upload binaries as release assets with deterministic names (e.g. `mesh-agent-linux-amd64`)
- [ ] Tag `v0.1.3` with current code (terminal event + per-command timeout)
- [ ] `install.sh` script: detect OS+arch, fetch `latest` release binary, run `install-service`
- [ ] Smoke test: `curl -sSL get.mesh.onetype.ai | sudo bash` on a clean VPS
- **Effort:** 2-3 hours
- **Why blocker:** current `install.sh` pulls an old binary that does not have terminal streaming or timeout. A brand-new user would hit bugs we've already fixed.

### 3. Logs dedup race lock ✅
- [x] Pass `{ lock: 'logs:write:' + team_id + ':' + action }` when internal callers run `onetype.PipelineRun('logs:write', ...)`
- [x] Verify that two concurrent calls with the same hash produce a single row with `hit_count += 1`, not two rows
- **Effort:** 15 min
- **Why blocker:** under real load (two users pressing the same button, or an agent re-sending on flaky network) we'd write duplicate logs. Audit trail integrity.
- **Done:** 19 handlers (all except system agents.connect/disconnect) serialize via lock key `logs:write:<team_id>:<action>`. Verified: 5 concurrent publish calls produce 1 log row with `hit_count: 5`, zero duplicates.

### 4. Database cleanup before first real users
- [ ] Drop test fixtures created during development (bulk `2026-04-22T10:28:17.519Z` logs, fake script names like `fads` / `gsdgfd`, soft-deleted packages that were never real)
- [ ] Verify `team_id` scoping is tight — no row leaks cross-team
- [ ] Reset sequences where it makes sense so the first public record isn't `#16817`
- **Effort:** 30-45 min
- **Why blocker:** new users should not see our sandbox noise or stumble into references to rows that no longer make sense.

### 5. `/api/logs` pagination actually honours `limit`
- [ ] Trace why `limit=N` returns a fixed page of 10 regardless of N (framework database filter layer vs `many.js` vs `Expose({})` defaults)
- [ ] Confirm `e-logs` can load the next page when the user scrolls or requests more
- **Effort:** 30 min once root cause is known
- **Why blocker:** users will hit this the first time they look at history. Broken pagination says "toy".

### 6. `actor_ip` and `actor_agent` populated on every log ✅
- [x] Every exposed command reads from `this.http.request.headers['x-forwarded-for']` (comma-split, first token) with fallback to `this.http.request.socket.remoteAddress`
- [x] User-Agent read from `this.http.request.headers['user-agent']`
- [x] Pass both into pipeline `state` alongside the user snapshot
- [x] All 21 log handlers read `this.state.actor_ip` / `this.state.actor_agent` and persist them
- **Effort:** 45 min
- **Why blocker:** audit logs without IP/UA are not a real audit trail — this is one of the first things any compliance-minded self-hoster will check.
- **Done:** framework already exposes `http.user = { ip, agent, ... }`; auth middleware populates `http.state.actor_ip/agent` before auth check; 19 log handlers read from `this.state` and persist. System events (agents.connect/disconnect) stay null — no HTTP context.

---

## 🟡 Strong preference — not technically blocking, but weak without them

### 7. Landing page at `mesh.onetype.ai`
- [ ] Hero with slogan "Your hardware. Your cloud. One click."
- [ ] 3 blocks: Fleet Manager / Service Platform / Mesh Gateway (with one sentence + icon each)
- [ ] Install command in a copy-paste box: `curl -sSL get.mesh.onetype.ai | sudo bash`
- [ ] 3-5 screenshots: dashboard, terminal streaming, logs with correlation flow, service deploy, gateway public URL
- [ ] Comparison strip: Mesh vs Coolify vs Portainer vs Fly.io (4-5 rows)
- [ ] GitHub / Docs / Discord (if you run one) links
- **Effort:** 4-8 hours with design
- **Why:** without a landing page no one clicks anywhere. This is where every tweet / HN post sends people.

### 8. `README.md` for `mesh-app`
- [ ] Title + one-sentence pitch + one screenshot above the fold
- [ ] Badges (license, stars, version, CI)
- [ ] "Why Mesh" — 3-bullet differentiator
- [ ] Quick start: `git clone`, `npm install`, `.env` setup, `node back`, visit `:3020`
- [ ] Architecture diagram (control plane ↔ gateway ↔ agent)
- [ ] Self-hosting guide link / section
- [ ] Contributing link
- **Effort:** 2-3 hours
- **Why:** GitHub repo front page is the second thing people see. Bad README kills inbound.

### 9. `.env.example`
- [ ] Copy the real `.env` structure without secrets
- [ ] Comment every variable with one-line explanation
- [ ] Remove the actual `.env` from the repo if it's in there; add to `.gitignore` if not already
- **Effort:** 10 min
- **Why:** first thing a self-hoster hits after `git clone`. Missing means friction.

### 10. Minimal docs under `/docs`
- [ ] `docs/quickstart.md` — from zero to first server connected in 5 minutes
- [ ] `docs/scripts.md` — what scripts are, how to write one, publish / attach
- [ ] `docs/packages.md` — package lifecycle, installed_condition, platforms
- [ ] `docs/services.md` — deploy / destroy / start / stop, public URL flow
- [ ] `docs/terminal.md` — one-shot semantics, SSH alternative, timeout rules
- [ ] `docs/self-hosting.md` — production deployment, Postgres setup, reverse proxy, environment
- [ ] `docs/architecture.md` — control plane ↔ gateway ↔ agent, protocol overview
- **Effort:** 1 full day to do all of them reasonably
- **Why:** reduces support burden at launch. Any unanswered question turns into an issue or a lost user.

### 11. Demo video / GIF
- [ ] 60-90 second screencast: add server → install agent → install a package live → deploy a service → visit public URL
- [ ] Short GIF loop version (10-15s) for the README hero
- [ ] Posted to YouTube + embedded on landing
- **Effort:** half a day including retakes
- **Why:** one video > 1000 words. Carries tweets and HN posts on its own.

### 12. Output / Error sanitization audit
- [ ] Confirm no stack traces, SQL snippets, or internal framework paths leak into user-facing responses or logs
- [ ] Confirm `truncate` limit inside `logs:write` sanitize join is actually hit under big stderr
- **Effort:** 1 hour of spot-checking
- **Why:** one embarrassing stack trace in a public launch screenshot is a bad look.

---

## 🟢 Post-launch nice-to-haves — add after first users

### 13. Retention cron
- Delete logs older than 90 days (configurable via env var)
- Same for terminal buffers older than 24h
- **Effort:** 30 min

### 14. Rate limit on `/api/agents/bash` and `/api/terminal/lines`
- Token bucket per team: e.g. 120 bash/min, 600 line-reads/min
- **Effort:** 1 hour

### 15. Status page at `/status`
- Agent count, online agents, recent events, uptime
- **Effort:** 2-3 hours

### 16. Full auth flow
- Registration → email verification → create team → invite members with scoped roles
- Trenutno only login + team for the logged-in user exists
- **Effort:** 1-2 days if role system is also in scope

### 17. Webhook / alert on `Error`-level logs
- User configures webhook URL in team settings
- Any `level: 'Error'` log POSTs a payload to that URL
- **Effort:** 2-3 hours

### 18. CSV / JSON export of logs for compliance
- `/api/logs/export?from=…&to=…&format=csv`
- Streamed response, auth-gated
- **Effort:** 2 hours

---

## 🔵 Marketing / launch-day assets

### 19. Twitter thread (5-7 tweets)
- Hook: "I built a self-hostable alternative to Coolify + Vast.ai + Fly.io."
- Tweet 2: Fleet manager — one dashboard, any Linux box. Screenshot.
- Tweet 3: Service marketplace — one click deploy, public URL included. Screenshot.
- Tweet 4: Compute marketplace — rent out idle hardware. Screenshot.
- Tweet 5: Live terminal / audit logs — what Coolify doesn't have. GIF.
- Tweet 6: Open source, AGPL, self-host in 60 seconds. Install command.
- Tweet 7: Link to GitHub + landing.

### 20. Reddit post for r/selfhosted
- Title: "Show r/selfhosted: Mesh — turn any Linux box into a managed cloud with one command"
- Body: 3-paragraph intro (what it is, what's different, how to try), 1-2 screenshots, GitHub link, AMA invitation in comments.

### 21. Hacker News "Show HN"
- Title: "Show HN: Mesh — self-hosted Coolify + Fly.io + Vast.ai in one binary"
- First comment from your account with the "why I built this" story (HN loves this format).
- Pick a Tuesday or Wednesday morning PT for best traction.

### 22. Short comparison page on the landing site
- Mesh vs Coolify vs Portainer vs Dokku vs Fly.io
- 6-8 feature rows with ✓/✗/partial markers
- Link from landing hero

### 23. Discord or GitHub Discussions for community
- One of the two. Pick before launch, not after the first issues roll in.

---

## Execution order

**This week (launch prep weekend):**
1. #3 race lock (15 min)
2. #4 DB cleanup (45 min)
3. #5 pagination fix (30 min)
4. #6 actor_ip / actor_agent (45 min)
5. #2 agent release pipeline + v0.1.3 (3 hours)
6. #1 gateway SSL (biggest block, 1-2 days)

**Next 3 days:**
7. #7 landing
8. #8 README
9. #9 .env.example
10. #10 minimal docs
11. #11 demo video
12. #12 sanitization pass

**Launch day:**
13. #19-21 marketing push

**Week after:**
14. Whatever #13-18 the real users ask for first

---

## Definition of "launched"

- [ ] `mesh.onetype.ai` live with landing + install curl command
- [ ] `github.com/onetype-ai/mesh-app` public with good README
- [ ] `github.com/onetype-ai/mesh-agent` public with release binaries
- [ ] A fresh VPS can go from zero to deployed service with public URL in under 10 minutes
- [ ] At least one tweet + one Reddit + one HN post live with links back
