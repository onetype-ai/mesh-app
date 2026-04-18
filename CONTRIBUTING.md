# Contributing to Mesh

Thanks for taking the time. A few things to know before you send a pull request.

## Before you start

Open an issue first for anything larger than a typo fix. It saves both of us from wasted work. For small fixes, skip straight to a PR.

If you are new to the codebase, read [CLAUDE.md](./CLAUDE.md) first. It covers the addon model, the three RPCs, the security rules, and the design principles. The project is deliberately small; expect to read the whole backend in an afternoon.

## Development setup

```bash
git clone https://github.com/onetype-ai/mesh-app
cd mesh-app
npm install
cp .env.example .env
node back
```

You need PostgreSQL locally and a `.env` with the database credentials. The backend binds HTTP to `:3020` and gRPC to `:50000` on start.

The agent lives in its own repo at [onetype-ai/mesh-agent](https://github.com/onetype-ai/mesh-agent). You only need it if you are working on agent-side features.

## Code style

Read existing files before writing new ones. The style is consistent on purpose.

**Formatting.** Allman brace style. Tabs, not spaces. One statement per line.

**Naming.** Short, concise, single whole words. `server`, `script`, `item`. No abbreviations.

**Structure.** Each file does one thing. Events in `events/`, commands in `commands/`, functions in `functions/`, expose callbacks in `expose.js`. Match the pattern; do not invent new ones.

**Errors.** Use `onetype.Error(code, 'Message :key:.', {key})` with `:key:` templating. Return codes and messages from stream handlers; do not throw inside them.

**Emits.** Event names start with `@`. Example: `@scripts.approval.needed`.

**No workarounds.** If something is broken, fix the real problem. Do not add a flag, a special case, or a comment explaining the hack.

**Comments.** Default to none. Code should read like prose. Only comment when the reason is not obvious from the code.

## Adding a feature

Most features are a script, not code. Before writing a new endpoint, a new command, or a new element, ask whether it fits as a script in the marketplace. If yes, write the script and submit it to the marketplace. If no, then write code.

When you do write code, keep the change contained. One addon, one domain, one PR. Split larger work into a sequence of small PRs.

## Submitting a pull request

- Base branch is `main`.
- Include a short description of what and why. Screenshots for UI changes.
- No lockfile churn unless you actually added a dependency.
- Run the backend locally before submitting; make sure the dashboard still loads.

## Security

Do not open issues for security reports. See [SECURITY.md](./SECURITY.md) for the private disclosure process.

## License

By submitting a pull request you agree to license your contribution under AGPL-3.0, same as the project.
