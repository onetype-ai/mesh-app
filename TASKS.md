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
- [ ] Pin `softprops/action-gh-release@<sha>` (not a movable tag) to avoid supply-chain hijack
- [ ] Verify downloaded binary against a detached signature or sha256 checksum fetched from the same release
- **Effort:** 2-3 hours
- **Why blocker:** current `install.sh` pulls an old binary that does not have terminal streaming or timeout. A brand-new user would hit bugs we've already fixed. Unsigned `curl | sudo bash` is a supply-chain risk.

### 3. Logs dedup race lock ✅
- [x] Pass `{ lock: 'logs:write:' + team_id + ':' + action }` when internal callers run `onetype.PipelineRun('logs:write', ...)`
- [x] Verify that two concurrent calls with the same hash produce a single row with `hit_count += 1`, not two rows
- **Effort:** 15 min
- **Why blocker:** under real load (two users pressing the same button, or an agent re-sending on flaky network) we'd write duplicate logs. Audit trail integrity.
- **Done:** 19 handlers (all except system agents.connect/disconnect) serialize via lock key `logs:write:<team_id>:<action>`. Verified: 5 concurrent publish calls produce 1 log row with `hit_count: 5`, zero duplicates.

### 4. Database cleanup + credential rotation before first real users
- [ ] Drop test fixtures created during development (bulk `2026-04-22T10:28:17.519Z` logs, fake script names like `fads` / `gsdgfd`, soft-deleted packages that were never real)
- [ ] Verify `team_id` scoping is tight — no row leaks cross-team
- [ ] Reset sequences where it makes sense so the first public record isn't `#16817`
- [ ] **Rotate the Postgres password** currently in root `.env` (`DB_PASSWORD=zU3213125435343Q5...`) — it is not committed but sits on disk and can leak via a single `git add -A` mistake
- [ ] Delete the literal `.env` file before opening the repo to the public; keep only `.env.example`
- [ ] Scrub git history if credentials ever touched a commit (`git filter-repo --path .env --invert-paths`)
- **Effort:** 45-60 min
- **Why blocker:** new users should not see our sandbox noise, and a leaked prod password owns the database of every self-hoster who clones the repo before rotation.

### 5. `/api/logs` pagination actually honours `limit`
- [ ] Trace why `limit=N` returns a fixed page of 10 regardless of N (framework database filter layer vs `many.js` vs `Expose({})` defaults)
- [ ] Confirm `e-logs` can load the next page when the user scrolls or requests more
- [ ] Add `(team_id, id DESC)` or `(team_id, created_at DESC)` index for keyset pagination — `OFFSET` will be painfully slow on 1M rows
- **Effort:** 45 min once root cause is known
- **Why blocker:** users will hit this the first time they look at history. Broken pagination says "toy".

### 6. `actor_ip` and `actor_agent` populated on every log ✅
- [x] Every exposed command reads from `this.http.request.headers['x-forwarded-for']` (comma-split, first token) with fallback to `this.http.request.socket.remoteAddress`
- [x] User-Agent read from `this.http.request.headers['user-agent']`
- [x] Pass both into pipeline `state` alongside the user snapshot
- [x] All 21 log handlers read `this.state.actor_ip` / `this.state.actor_agent` and persist them
- **Effort:** 45 min
- **Why blocker:** audit logs without IP/UA are not a real audit trail — this is one of the first things any compliance-minded self-hoster will check.
- **Done:** framework already exposes `http.user = { ip, agent, ... }`; auth middleware populates `http.state.actor_ip/agent` before auth check; 19 log handlers read from `this.state` and persist. System events (agents.connect/disconnect) stay null — no HTTP context.

### 7. Agent gRPC channel is plaintext (`insecure.NewCredentials()`)
- [ ] Server side: generate a TLS cert (self-signed for dev, Let's Encrypt for prod) for the gRPC gateway
- [ ] `grpcServers.Item({ tls: { cert, key } })` path added to the framework — or expose the raw gRPC server option
- [ ] Agent side: `grpc.WithTransportCredentials(credentials.NewTLS(...))` replacing the insecure path in `mesh-agent/gateway.go:48`
- [ ] Support self-signed mode in dev via explicit `--insecure` agent flag, never default
- [ ] Verify: `tcpdump` on :50000 shows no cleartext tokens during handshake
- **Effort:** 3-4 hours
- **Why blocker:** the 64-char registration token and every bash stdout/stderr currently travel unencrypted. Passive MITM on any hop between agent and gateway clones the server. Absolute no-go for production.

### 8. Server `token` leaks via `/api/servers` response
- [ ] `GetData()` strips (or `select([...])` whitelists) `token` field on any outbound server record
- [ ] Audit every addon `Expose({ select: [...] })` and individual command `resolve(item.GetData())` path for secrets leaking through the `GetData` default
- [ ] Add a `hidden: true` field flag in the framework so fields like `token` can never be serialised to HTTP response
- **Effort:** 2 hours
- **Why blocker:** any team member (or a stolen session) can read the agent registration token and attach a rogue agent impersonating that server. Effectively team-wide RCE.

### 9. `agents:bash` is full RCE fleetwide when passphrase is unset
- [ ] Agent refuses to register without a passphrase in production mode (add `--require-passphrase` default true in release builds)
- [ ] `PassphraseMatches("")` returning true when passphrase is empty is a foot-gun — invert so empty-against-set always fails
- [ ] Add per-user step-up (2FA or re-enter password) for the `agents:bash` exposed command — not every team member should have one-click fleet shell
- **Effort:** 3 hours
- **Why blocker:** a stolen cookie becomes `rm -rf /` on every server in the team. This is the single worst blast-radius bug in the codebase.

### 10. Audit all addon `many.js` / `one.js` for missing auth / team scope ✅
- [x] Gateways: global infra (SSL), auth-only — no team_id needed. Confirmed `back/addons/gateways/core/expose.js` already auth-gated.
- [x] approvals, logs, packages, scripts, servers, services: all expose blocks enforce login + `team_id` filter. Verified via `grep -A 10 "find: function" back/addons/*/core/expose.js`.
- [ ] Still pending: delete / update commands (not via Expose) — see #13 (servers:update) and #30 (approvals:delete) for known cases.
- **Effort:** 20 min
- **Why blocker:** any read endpoint without team scope leaks cross-tenant data. All `Expose({})`-backed addons clean; manual command endpoints still need individual audit.

### 11. CORS reflects any `Origin`
- [ ] Replace reflected `Access-Control-Allow-Origin` with a whitelist read from env (e.g. `CORS_ORIGINS=https://mesh.onetype.ai,https://app.example.com`)
- [ ] Drop `Access-Control-Allow-Credentials: true` unless origin is on the whitelist
- [ ] Narrow cookie domain scope — do not default to `.host`
- **Effort:** 30 min
- **Why blocker:** combined with Bearer-token auth, any site can XHR the API after stealing a token; CSRF surface is wide open.

### 12. User-controlled `filter.field` / `sort_field` column names
- [ ] Every addon `Expose({ filter: [...], sort: [...] })` must hard-whitelist column names; reject anything not in the list with 400
- [ ] Framework filter builder rejects unknown column names upfront (today it passes them to Knex which happily quotes them)
- **Effort:** 1-2 hours
- **Why blocker:** authed user can sort/filter on `token`, `password`, `passphrase`, etc., and exfiltrate secrets via blind response-size/row-count side channel.

### 13. `servers:update` whitelist enforced by iteration, not schema
- [ ] In `back/addons/servers/items/commands/crud/update.js`, iterate over the `--pick` whitelist explicitly — not `Object.entries(properties)`
- [ ] Same audit on every `*/crud/update.js` in the codebase
- **Effort:** 30 min
- **Why blocker:** if `--pick` is ever widened or a framework change lets extras through, `token`/`team_id`/`status` become writable from the wire. Privilege escalation waiting to happen.

### 14. `marketplace:import:*` does not hard-gate `is_marketplace=true`
- [ ] Inside `marketplace:import:script/package/service` pipelines, first join must filter `.filter('is_marketplace', true).filter('status', 'Published')` and refuse with 404 otherwise
- [ ] Add a negative test: user from team A tries to import team B's private package by id — must get 404
- **Effort:** 30 min
- **Why blocker:** without this, any user can clone any other team's private package by guessing or enumerating ids — copies the install bash into their own team library.

### 15. Login/register pages are branded as "OneType Travel"
- [ ] `front/addons/system/account/items/elements/login/login.js:46-70` — replace travel copy, Unsplash beach photo, `traveller@example.com` placeholder with Mesh branding
- [ ] `front/addons/system/account/items/elements/register/register.js:66-97` — same
- [ ] `front/addons/system/account/items/pages/register/register.js:6` — title "Create account - OneType Travel" → "Create account - Mesh"
- [ ] Audit entire front for any other stray "Travel" / wrong-product strings
- **Effort:** 1 hour
- **Why blocker:** first screen a new user sees says they're on a travel booking site. Instant bounce.

### 16. Dashboard `/` is entirely fake data
- [ ] `front/items/pages/home/home.js:32-109` — hardcoded "Ryzen Beast", fake metrics, static "47% Fleet capacity"
- [ ] When fleet is empty → render empty-state hero with CTA pointing to `/servers/create`
- [ ] When fleet has servers → wire real aggregate stats (total CPU/RAM from `servers.metrics`, online count, recent events)
- **Effort:** 3-4 hours
- **Why blocker:** first-time user with 0 servers still sees "2 online, 22.7 GB, +22% vs 24h" — obvious lie, destroys trust immediately.

### 17. Dead "Coming soon…" buttons on core verbs
- [ ] Packages Install popup → proper flow (`front/addons/packages/items/pages/packages/packages.js:76,113`)
- [ ] Scripts Attach popup → proper flow (`front/addons/scripts/items/pages/scripts/scripts.js:77,114`)
- [ ] Services Deploy popup → proper flow (`front/addons/services/items/pages/services/services.js:76,113`)
- [ ] Alternative: hide these buttons entirely until the flows land
- **Effort:** either 3-4 hours to wire flows, or 10 min to hide
- **Why blocker:** marketed primary verbs of the product currently do nothing. Launching like this is dishonest.

### 18. `install.sh` host `mesh.onetype.ai` is not live yet
- [ ] Stand up the landing origin that serves `install.sh` (overlap with #1 gateway + #7 landing)
- [ ] Verify `front/addons/servers/items/elements/setup/setup.js:67` generated command actually resolves and runs
- **Effort:** overlaps #1 and #7
- **Why blocker:** every new server setup panel tells the user to run a command that DNS-fails. They give up.

### 19. FK + cascade on `mesh_servers_*` join tables
- [ ] Add `ON DELETE CASCADE` (or at least `ON DELETE SET NULL`) to `servers_scripts`, `servers_packages`, `servers_services` foreign keys
- [ ] `servers:delete` also cascade-soft-deletes join rows in the same transaction
- **Effort:** 1 hour
- **Why blocker:** deleting a server leaves orphan join rows that still reference it; UI guards ("already installed") return stale 409s forever.

### 20. Unique partial indexes on join tables
- [ ] `CREATE UNIQUE INDEX ... ON servers_scripts (server_id, script_id) WHERE deleted_at IS NULL`
- [ ] Same for `servers_packages` and `servers_services`
- [ ] Lets Postgres enforce single-row truth instead of relying on the pipeline `guard` step
- **Effort:** 20 min
- **Why blocker:** two parallel "Install" clicks currently both pass the guard check and both write a join row. Data integrity at the DB level, not just the app.

### 21. Missing composite indexes for list queries
- [ ] `mesh_logs`: `(team_id, created_at DESC) WHERE deleted_at IS NULL`
- [ ] `mesh_packages/services/scripts`: `(team_id, status) WHERE deleted_at IS NULL`
- [ ] `mesh_servers`: `(team_id, status) WHERE deleted_at IS NULL`
- **Effort:** 30 min
- **Why blocker:** on real data (10k+ rows per team) the dashboard's dominant queries will seq-scan + sort, making every page a multi-second wait.

### 22. `mesh_servers.metrics` jsonb is uncapped
- [ ] In `agents:metrics.dynamic` `save` join, reject if `JSON.stringify(metrics).length > 64 * 1024`
- [ ] Drop unknown keys that are not declared in the active script's `metrics` schema before save
- **Effort:** 30 min
- **Why blocker:** a compromised or buggy agent returning 10MB of JSON will TOAST-explode, bloat backups, and grind the dashboard to a halt.

### 23. Auto schema bootstrap on empty database
- [ ] On boot, detect empty DB and run all `shared/addons/*/schema.sql` in order
- [ ] Missing `mesh_users` and `mesh_teams` schema files — add them (they're clearly assumed to exist)
- [ ] Document `npm run migrate` script as the escape hatch
- **Effort:** 2-3 hours
- **Why blocker:** self-hoster does `git clone + npm install + node back` on empty Postgres → crash on first query. Project is unusable out of the box.

### 24. Configurable `HTTP_PORT` and `GRPC_PORT` ✅
- [x] Replace hardcoded `3020` in `back/items/servers/http.js:3` with `process.env.HTTP_PORT || 3020`
- [x] Replace hardcoded `50000` in `back/addons/agents/items/servers/grpc.js:6` with `process.env.GRPC_PORT || 50000`
- [ ] Document both in `.env.example`
- **Effort:** 15 min
- **Why blocker:** any self-hoster already using 3020 or behind a reverse proxy is blocked. Trivial fix, ship it.
- **Done:** verified `HTTP_PORT=4040 GRPC_PORT=51000 node back` binds to the overridden ports and logs them correctly. `.env.example` doc pending (part of #31).

### 25. Process supervisor + Node engines pin
- [ ] Ship `deploy/mesh-app.service` (systemd) and `deploy/docker-compose.yml` in the repo
- [ ] `package.json` → `"engines": { "node": ">=20.12" }` (required for `process.loadEnvFile` and `import.meta.dirname`)
- [ ] Add `.nvmrc` with `20.12`
- [ ] README snippet: systemd install OR docker-compose run
- **Effort:** 1 hour
- **Why blocker:** `node back` crash with no restart = offline service. Undocumented Node version = half of clones crash on startup.

### 26. `.env` mandatory but file does not exist → friendly error ✅
- [x] Guard `process.loadEnvFile` call with `existsSync`, print clear "Copy .env.example to .env and fill it in." message
- [ ] Ship `.env.example` as required-for-boot (overlap with #9/#31)
- **Effort:** 10 min
- **Why blocker:** fresh self-hoster sees a stack trace instead of a useful message. First-impression disaster.
- **Done:** `back/env.js` checks `existsSync` before loading; prints path + `cp .env.example .env` hint and exits cleanly. `.env.example` doc pending (#31).

### 27. `/health` must check DB and gRPC, not just uptime
- [ ] `SELECT 1` against the DB pool with 1s timeout
- [ ] Confirm gRPC server is listening
- [ ] Return 503 (not 200) when either fails
- **Effort:** 20 min
- **Why blocker:** load balancer keeps routing to a dead process. Self-hosters behind Caddy/nginx will have ghost outages.

### 28. Redirect after `servers:create` success
- [ ] `front/addons/servers/items/pages/create/create.js:180-192` — on 200 do `$ot.page('/servers/' + result.data.id + '/setup')` + success toast
- [ ] Same audit on all create flows (script/package/service) — does clicking "Create" actually navigate somewhere?
- **Effort:** 30 min
- **Why blocker:** user clicks Create, nothing visible happens, they click again → duplicate records.

### 29. Delete "Coming soon…" orphan test pages from routed build
- [ ] Remove `front/addons/dashboard/items/pages/test/` , `test2/`, `test3/`
- [ ] Audit for other dead routes
- **Effort:** 5 min
- **Why blocker:** stranger pen-testers will find them. Looks unfinished.

### 30. `approvals:delete` + entire CRUD missing auth/team scope ✅
- [x] `approvals/items/commands/crud/delete.js` — login guard + `.filter('team_id', ...).filter('deleted_at', null, 'NULL')`
- [x] `approvals/items/commands/crud/update.js` — login guard + team scope + whitelist (`is_approved` only, no more `Object.entries(properties)` write-anything)
- [x] `approvals/items/commands/crud/create.js` — login guard + force `team_id` from session, never trust client
- [x] Verified: `/api/commands/run` with `approvals:delete` returns 403 "Command is not exposed" (framework-level defense in depth); our callback-level auth is the second layer in case exposure flips later
- **Effort:** 10 min
- **Why blocker:** any authenticated user could soft-delete / mutate / create approvals across teams if `exposed: true` were ever added without anyone noticing. Defense in depth ensures the callback refuses regardless.
- **Done:** all 4 approvals CRUD files now auth-guard + team-scope + whitelist-write. `many.js` and `one.js` already had scope.

### 31. `.env.example` (+ lock down `.env`)
- [ ] Copy the real `.env` structure without secrets, comment every variable
- [ ] Add `.env` to `.gitignore` and verify history has no leak
- [ ] `.env.example` includes every required key for first boot (DB, ports, gateway host, session secret)
- **Effort:** 15 min
- **Why blocker:** first thing a self-hoster hits after `git clone`. Missing keys = crashes without explanation.

---

## 🟡 Strong preference — not technically blocking, but weak without them

### 32. Landing page at `mesh.onetype.ai`
- [ ] Hero with slogan "Your hardware. Your cloud. One click."
- [ ] 3 blocks: Fleet Manager / Service Platform / Mesh Gateway (with one sentence + icon each)
- [ ] Install command in a copy-paste box: `curl -sSL get.mesh.onetype.ai | sudo bash`
- [ ] 3-5 screenshots: dashboard, terminal streaming, logs with correlation flow, service deploy, gateway public URL
- [ ] Comparison strip: Mesh vs Coolify vs Portainer vs Fly.io (4-5 rows)
- [ ] GitHub / Docs / Discord (if you run one) links
- **Effort:** 4-8 hours with design
- **Why:** without a landing page no one clicks anywhere. This is where every tweet / HN post sends people.

### 33. `README.md` for `mesh-app`
- [ ] Title + one-sentence pitch + one screenshot above the fold
- [ ] Badges (license, stars, version, CI)
- [ ] "Why Mesh" — 3-bullet differentiator
- [ ] Quick start: `git clone`, `npm install`, `.env` setup, `node back`, visit `:3020`
- [ ] Architecture diagram (control plane ↔ gateway ↔ agent)
- [ ] Self-hosting guide link / section
- [ ] Contributing link
- [ ] Copyright header naming holder (`Copyright (C) 2025-2026 Dejan Tomic / OneType`)
- **Effort:** 2-3 hours
- **Why:** GitHub repo front page is the second thing people see. Bad README kills inbound.

### 34. Minimal docs under `/docs`
- [ ] `docs/quickstart.md` — from zero to first server connected in 5 minutes
- [ ] `docs/scripts.md` — what scripts are, how to write one, publish / attach
- [ ] `docs/packages.md` — package lifecycle, installed_condition, platforms
- [ ] `docs/services.md` — deploy / destroy / start / stop, public URL flow
- [ ] `docs/terminal.md` — one-shot semantics, SSH alternative, timeout rules
- [ ] `docs/self-hosting.md` — production deployment, Postgres setup, reverse proxy (Caddy/nginx), TLS on the control plane, systemd, environment, **AGPL §13 network-service source-disclosure obligation**
- [ ] `docs/architecture.md` — control plane ↔ gateway ↔ agent, protocol overview
- [ ] `docs/privacy-template.md` — starting point self-hosters can adapt for GDPR
- [ ] `docs/abuse.md` — DMCA / takedown flow for the public gateway once marketplace is live
- [ ] `docs/dr.md` — backup/restore runbook; on agent reconnect push approved hashes from `mesh_approvals` back into agent memory
- **Effort:** 1-2 full days
- **Why:** reduces support burden at launch. Any unanswered question turns into an issue or a lost user.

### 35. Demo video / GIF
- [ ] 60-90 second screencast: add server → install agent → install a package live → deploy a service → visit public URL
- [ ] Short GIF loop version (10-15s) for the README hero
- [ ] Posted to YouTube + embedded on landing
- **Effort:** half a day including retakes
- **Why:** one video > 1000 words. Carries tweets and HN posts on its own.

### 36. Output / Error sanitization audit
- [ ] Confirm no stack traces, SQL snippets, or internal framework paths leak into user-facing responses
- [ ] `back/config.js` `@error` emitter currently does bare `console.log(error)` — scrub password/token fields before logging, never log full request bodies
- [ ] Confirm `truncate` limit inside `logs:write` sanitize join is actually hit under big stderr
- [ ] After per-key truncate, cap total `JSON.stringify(clean).length` to ~16KB
- **Effort:** 2 hours of spot-checking + fixing
- **Why:** one embarrassing stack trace in a public launch screenshot is a bad look; logged passwords turn the log file into a secret store.

### 37. Password strength + register hardening
- [ ] `back/services/auth/items/commands/register.js` — enforce min 12 chars, reject common/breached passwords (optional HIBP k-anonymity check)
- [ ] Rate limit `/api/auth/login` and `/api/auth/register` per IP (5/min) — credential stuffing is the first thing scanners try on launch day
- **Effort:** 1 hour
- **Why:** without this, a 1-char password is accepted and a single compromised login lets in anyone.

### 38. Security headers / CSP / HSTS on control plane
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (behind TLS)
- [ ] `Content-Security-Policy` with self + needed font/image hosts (or fully self-hosted — see #43)
- [ ] `Secure`, `HttpOnly`, `SameSite=Lax` on the session cookie
- **Effort:** 45 min
- **Why:** XSS in any rendered addon becomes session theft today. Cheapest hardening to ship.

### 39. Graceful shutdown for HTTP, gRPC, and DB
- [ ] Register SIGTERM/SIGINT handler that stops the HTTP server (draining in-flight), ends all gRPC agent streams cleanly, and drains the Postgres pool
- [ ] Verify: `kill -TERM <pid>` returns 0 requests-in-flight and no half-written rows
- **Effort:** 2 hours
- **Why:** deploys, OOM kills, and systemd restarts currently drop in-flight requests and leave agents thinking they're still connected.

### 40. Structured logging + quieting gRPC per-message chatter
- [ ] Replace `console.log` with pino (or winston) behind `LOG_LEVEL` env var — JSON in prod, pretty in dev
- [ ] `[grpc] <- ...` per-message logs should be `debug` level, not `info`
- [ ] Document log rotation strategy (systemd journal OR logrotate config for file logger)
- **Effort:** 2-3 hours
- **Why:** self-hosters see an unsearchable stdout firehose today. After 1 hour the terminal is useless.

### 41. TLS docs for the control plane + reverse proxy example
- [ ] `docs/self-hosting.md` — Caddy one-liner and nginx snippet for terminating TLS in front of `:3020`
- [ ] Document `COOKIE_SECURE=true` requirement when running behind HTTPS
- **Effort:** 1 hour (docs only)
- **Why:** `:3020` is plaintext HTTP by default. Without a docs nudge, half of self-hosters will run it in the open.

### 42. Schema migration strategy for v1.1+
- [ ] Introduce a `mesh_migrations` tracking table with ordered, idempotent migration files
- [ ] `migrations/2026_04_22_initial.sql` is just the current `shared/addons/*/schema.sql` concatenated
- [ ] Document "how to add a column in a backwards-compatible way" in `docs/contributing.md`
- **Effort:** 3 hours
- **Why:** `CREATE IF NOT EXISTS` silently skips existing tables. v1.1 adding one column = broken self-hosters.

### 43. Google Fonts CDN → self-hosted fonts
- [ ] `back/items/html/fonts.js:10` — stop hotlinking `fonts.googleapis.com`
- [ ] Host Geist / Geist Mono / JetBrains Mono locally under `/assets/fonts/`
- [ ] Same for Material Symbols Rounded — host the variable font locally
- [ ] Add `NOTICE` file crediting SIL OFL (Geist/JetBrains), Apache-2.0 (Material Symbols)
- **Effort:** 2 hours
- **Why:** every dashboard load today pings Google — GDPR flashpoint for EU self-hosters (German courts ruled against this in 2022). Also one less runtime dependency.

### 44. Mobile responsiveness pass
- [ ] Every page uses a fixed `68px 260px 1fr` grid — add `@media (max-width: 900px)` that collapses dock + server sidebar under a hamburger
- [ ] Audit every dashboard card for horizontal overflow on 375px viewport
- [ ] Test terminal element on a phone — does the textarea work? Does the prompt float correctly?
- **Effort:** 4-6 hours
- **Why:** today the dashboard is unusable below ~900px. Half the marketing clicks on launch day will be from a phone.

### 45. First-run onboarding + clean empty states
- [ ] Home `/` with 0 servers → setup card pointing to `/servers/create`
- [ ] `/servers`, `/packages`, `/scripts`, `/services` empty lists — every one gets an `e-status-empty` with a CTA
- [ ] After creating a server, walk the user through the setup/install step (see #28)
- [ ] Delete success should redirect with toast (`servers:delete` in settings today just sets `deleting=false` and does nothing visible)
- **Effort:** 4-6 hours
- **Why:** the path from register → "I ran my first thing" is the single most important thing to nail. Right now it's a series of dead ends and fake stats.

### 46. Settings sub-pages reachable from dock
- [ ] `/settings` has sub-pages for security/appearance/notifications but the dock only shows "Settings" with no submenu
- [ ] Either add settings tabs on the page or register a submenu in the dock
- **Effort:** 30 min
- **Why:** users can't change their own password without knowing the URL. Silly blocker.

### 47. Global error UX for `$ot.command` failures
- [ ] Central wrapper/helper that inspects `code !== 200` on every `$ot.command` call and surfaces a toast
- [ ] Today `this.save`, `this.change`, `this.remove` callers silently succeed even on backend 500s
- **Effort:** 2 hours
- **Why:** users think things worked when they didn't. Support ticket magnet.

### 48. Loading skeletons on route-level `data:` fetch
- [ ] `/packages`, `/scripts`, `/services` load 3 queries before first paint — blank main area for 300-800ms
- [ ] Page-level `<e-status-loading>` or skeleton cards while the Promise resolves
- **Effort:** 1 hour
- **Why:** blank pages feel broken. Cheap fix for a huge perceived-quality gain.

### 49. Error UX for install/timeout/agent-offline states
- [ ] Test connection failure on `/servers/:id/setup` gives no diagnostic (`setup.js:185-193`) — add "common causes" expander + link to agent logs
- [ ] Agent offline → "Server is offline" banner with reconnect countdown, not a 404
- [ ] Bash timeout → friendly message "Command timed out after 2 minutes. Use SSH for long-running or interactive commands."
- **Effort:** 2-3 hours
- **Why:** failure modes are where users abandon. Make them feel handled, not broken.

### 50. Remove stray `console.log` from backend commands
- [ ] `back/addons/servers/items/commands/ping.js:36` — remove the per-hit `console.log`
- [ ] Grep the whole backend for `console.log` left from debugging and clean up
- **Effort:** 20 min
- **Why:** self-hoster's systemd journal is flooded from day one.

### 51. Transactions: don't hold a 30-minute DB lock while `agents:bash` runs
- [ ] `back/addons/servers/core/pipelines/packages/install.js` — separate the long bash exec from the short join-row `Create`; only wrap the Create in `database.Fn('transaction', ...)`
- [ ] Same surgery for `services:deploy` / `destroy` / `start` / `stop` / `restart`
- **Effort:** 2 hours
- **Why:** today a slow install blocks metric updates and every other write on `mesh_servers` / `mesh_packages` for up to 30 minutes.

### 52. Duplicate unique constraints on `(team_id, name)`
- [ ] `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL` on `(team_id, name)` for `servers`, `scripts`, `packages`, `services`
- **Effort:** 20 min
- **Why:** two servers/scripts/packages with identical name per team confuse the UI and break the audit log's `target_*` lookups.

### 53. Drop redundant `servers.scripts/packages/services` bigint[] columns
- [ ] Derive from join tables (they're the source of truth)
- [ ] Migration to drop the three array columns from `mesh_servers`
- **Effort:** 30 min
- **Why:** two sources of truth that drift; writes go to join tables, arrays stay stale and lie to consumers.

### 54. Cascade-aware delete for referenced scripts
- [ ] `back/addons/scripts/items/commands/crud/delete.js` — before soft-delete, check `packages` / `services` referencing it; return 409 with names of blockers
- [ ] Or cascade soft-delete through the reference tree (risky — prefer refusal)
- **Effort:** 1 hour
- **Why:** today you can soft-delete a script referenced by `script_install_id`, and the next install attempt errors with "Install script missing" instead of refusing the delete.

### 55. Terminal buffer TTL + global cap
- [ ] Today: 1000-line cap per server, never trimmed by age
- [ ] Add a periodic sweep (every 5 min) that drops lines older than 1h and enforces a global cap (e.g. 50k lines total in memory)
- [ ] If retention cron (#13) needs a terminal table, decide whether to persist or explicitly document terminal as ephemeral
- **Effort:** 1 hour
- **Why:** 100 agents spamming events can hold hundreds of thousands of lines in RAM forever.

### 56. Seed default `gateways` row on boot
- [ ] On empty DB, insert a default `gateways` row with `host = os.hostname()` + port 50000
- [ ] Or require `MESH_GATEWAY_HOST` env var and fail boot with a clear message if missing
- **Effort:** 30 min
- **Why:** `install.sh` generator today reads from the gateways table; on a fresh self-host there are zero rows, so the generated command gets empty `host:port`.

### 57. CONTRIBUTING.md + SECURITY.md in mesh-app
- [ ] `CONTRIBUTING.md` with DCO (Developer Certificate of Origin) sign-off requirement and explicit "inbound = AGPL-3.0" clause
- [ ] `SECURITY.md` adapted from the agent repo for control-plane scope (how to report, response SLA, disclosure policy)
- **Effort:** 1 hour
- **Why:** accepting a stranger PR without DCO creates relicensing risk. No SECURITY.md = security researchers go public instead of emailing.

### 58. Decide framework license (MIT vs AGPL/dual)
- [ ] `@onetype/framework` is MIT in `framework/package.json:60`. Mesh-app is AGPL-3.0.
- [ ] If the framework ever becomes the basis of a paid product, MIT means competitors can fork without the AGPL obligation
- [ ] Choose now: keep MIT (open ecosystem, no leverage), or relicense to AGPL/dual-license before first external contributor
- **Effort:** decision (no code), 30 min to flip LICENSE if needed
- **Why:** relicensing after accepting PRs is legally and practically very hard.

### 59. Trademark knockout search
- [ ] USPTO / EUIPO search for "Mesh" in Class 42 (SaaS) — AWS App Mesh, Cisco Meraki Mesh, Istio service mesh are all in the neighbourhood
- [ ] Consider rebranding to "OneType Mesh" for marketing copy (product name can stay "Mesh" internally)
- [ ] File TM application for "OneType" in Class 42 before HN launch
- **Effort:** 2-3 hours research + filing fee
- **Why:** an earlier trademark holder can force a rename of the product after you've built a brand.

### 60. Export control (ECCN) one-time notification
- [ ] Agent uses TLS through `google.golang.org/grpc` — qualifies as mass-market cryptography under TSU exception (15 CFR §742.15(b))
- [ ] Email `crypt@bis.doc.gov` and `enc@nsa.gov` on launch day with repo URL
- **Effort:** 15 min (one email)
- **Why:** legal requirement for publicly distributing open-source crypto from the US. Skipping it is a compliance risk that's trivially cheap to cure.

### 61. DMCA agent registration for the public gateway
- [ ] Register a DMCA agent with the US Copyright Office (~$6) before `mesh.onetype.ai` routes third-party content
- [ ] `docs/abuse.md` with takedown instructions
- **Effort:** 30 min + filing fee
- **Why:** without a registered agent, you lose §512(c) safe harbor on any user-submitted service/package that routes through your gateway.

---

## 🟢 Post-launch nice-to-haves — add after first users

### 62. Retention cron
- Delete logs older than 90 days (configurable via env var)
- Same for terminal buffers older than 24h if we end up persisting them
- **Effort:** 30 min

### 63. Rate limit on `/api/agents/bash` and `/api/terminal/lines`
- Token bucket per team: e.g. 120 bash/min, 600 line-reads/min
- *Note:* auth endpoints were upgraded to blocker (#37); this one is only for the bash/terminal load pattern
- **Effort:** 1 hour

### 64. Status page at `/status`
- Agent count, online agents, recent events, uptime
- **Effort:** 2-3 hours

### 65. Full auth flow
- Registration → email verification → create team → invite members with scoped roles (admin / member / read-only)
- Today: only login + team for the logged-in user exists
- **Effort:** 1-2 days if role system is also in scope

### 66. Webhook / alert on `Error`-level logs
- User configures webhook URL in team settings
- Any `level: 'Error'` log POSTs a payload to that URL
- Optional Sentry-style DSN integration for the backend itself
- **Effort:** 2-3 hours

### 67. CSV / JSON export of logs for compliance
- `/api/logs/export?from=…&to=…&format=csv`
- Streamed response, auth-gated, same scoping as `/api/logs`
- **Effort:** 2 hours

### 68. Multi-instance readiness
- Today `agents.Items()` and `terminal.Items()` are per-process in-memory — running 2 `node back` behind a LB breaks agent visibility
- Plan Redis pub/sub or `pg_notify` to fan out agent registrations across instances
- For launch: just document "single control-plane instance" in self-hosting docs
- **Effort:** deferred post-launch; 15 min to document the limitation now

### 69. Pin `@onetype/framework` to exact version for launch
- `package.json:27-29` uses `^2.0.55` — carets allow minor drift
- Pin exact for launch; bump deliberately afterwards
- **Effort:** 2 min

### 70. Windows dev caveat
- README notes: "Dev on Linux/macOS; Windows developers should use WSL2"
- **Effort:** 5 min

---

## 🔵 Marketing / launch-day assets

### 71. Twitter thread (5-7 tweets)
- Hook: "I built a self-hostable alternative to Coolify + Vast.ai + Fly.io."
- Tweet 2: Fleet manager — one dashboard, any Linux box. Screenshot.
- Tweet 3: Service marketplace — one click deploy, public URL included. Screenshot.
- Tweet 4: Compute marketplace — rent out idle hardware. Screenshot.
- Tweet 5: Live terminal / audit logs — what Coolify doesn't have. GIF.
- Tweet 6: Open source, AGPL, self-host in 60 seconds. Install command.
- Tweet 7: Link to GitHub + landing.

### 72. Reddit post for r/selfhosted
- Title: "Show r/selfhosted: Mesh — turn any Linux box into a managed cloud with one command"
- Body: 3-paragraph intro (what it is, what's different, how to try), 1-2 screenshots, GitHub link, AMA invitation in comments.

### 73. Hacker News "Show HN"
- Title: "Show HN: Mesh — self-hosted Coolify + Fly.io + Vast.ai in one binary"
- First comment from your account with the "why I built this" story.
- Pick a Tuesday or Wednesday morning PT for best traction.

### 74. Short comparison page on the landing site
- Mesh vs Coolify vs Portainer vs Dokku vs Fly.io
- 6-8 feature rows with ✓/✗/partial markers
- Link from landing hero

### 75. Discord or GitHub Discussions for community
- Pick one before launch, not after the first issues roll in.

---

## Execution order

**This week (launch prep):**
1. ✅ #3 race lock (done)
2. ✅ #6 actor_ip / actor_agent (done)
3. #4 DB cleanup + credential rotation (60 min)
4. #5 pagination fix (45 min)
5. #7 agent gRPC TLS (3-4 hours)
6. #8 strip server `token` from responses (2 hours)
7. #10 `/api/gateways` team scope + audit other `many.js` files (30 min)
8. #11 CORS whitelist (30 min)
9. #12 filter/sort column whitelist (1-2 hours)
10. #13 servers:update whitelist iteration (30 min)
11. #14 marketplace import is_marketplace gate (30 min)
12. #30 approvals:delete team scope (10 min)
13. #24 configurable ports (15 min)
14. #26 friendly .env error (10 min)
15. #31 .env.example (15 min)
16. #50 remove stray console.log (20 min)
17. #29 delete test orphan pages (5 min)

**Next 3-4 days:**
18. #1 gateway SSL (1-2 days — the big one)
19. #2 agent release pipeline + v0.1.3 (2-3 hours)
20. #9 agent RCE passphrase enforcement (3 hours)
21. #15 de-Travel login/register (1 hour)
22. #16 dashboard home empty state + real stats (3-4 hours)
23. #17 wire or hide "Coming soon" verbs (10 min - 4 hours)
24. #19-22 DB integrity (FK, unique indexes, composite indexes, metrics cap) (3 hours total)
25. #23 schema bootstrap (2-3 hours)
26. #25 process supervisor + engines pin (1 hour)
27. #27 real /health (20 min)
28. #28 redirect after create (30 min)

**Polish pass (2-3 days):**
29. #32 landing
30. #33 README
31. #34 docs (self-hosting incl. AGPL §13 + privacy + DMCA + DR)
32. #35 demo video
33. #36 sanitization
34. #37 password strength
35. #38 security headers
36. #39 graceful shutdown
37. #40 structured logging
38. #41 TLS docs
39. #42 migration framework
40. #43 self-host fonts
41. #44 mobile responsiveness
42. #45 first-run onboarding
43. #46-50 polish items
44. #51-56 DB/ops polish
45. #57-61 legal polish

**Launch day:**
46. #71-75 marketing push

**Week after:**
47. Whatever #62-70 the real users ask for first

---

## Definition of "launched"

- [ ] `mesh.onetype.ai` live with landing + install curl command
- [ ] `github.com/onetype-ai/mesh-app` public with good README
- [ ] `github.com/onetype-ai/mesh-agent` public with release binaries
- [ ] A fresh VPS can go from zero to deployed service with public URL in under 10 minutes
- [ ] No critical security findings from a 15-minute third-party skim
- [ ] Agent-gateway traffic is TLS-encrypted end to end
- [ ] Credentials in `.env` are rotated; no secrets in the repo or history
- [ ] At least one tweet + one Reddit + one HN post live with links back
