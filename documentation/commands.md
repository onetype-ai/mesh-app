# Commands

Mesh-specific HTTP commands. Framework commands (`commands:run`, `commands:get:*`, `pages:change`, etc.) and auth commands (`auth:login`, `auth:register`, ...) are not listed here.

All endpoints are `POST` unless noted. Responses follow the standard envelope `{ data, message, code, time }`.

## Calling commands

Commands can be invoked from both `back` and `front` with the same `$ot.command()` API. The third argument switches between local execution and an HTTP call.

```js
// back — runs the command in-process
const data = await $ot.command('packages:install', { server: '1', package: '3' });

// front — same call runs in-process if the command is registered locally
const data = await $ot.command('packages:install', { server: '1', package: '3' });

// front — pass `true` to route through /api/commands/run instead
const data = await $ot.command('packages:install', { server: '1', package: '3' }, true);
```

No `try` / `catch` is needed around command calls. Every command resolves with the same envelope shape (`{ data, message, code, time }`), and `$ot.command` throws `onetype.Error(code, message)` on non-2xx codes so the caller can handle them uniformly.

## packages

### packages:install

Run a package's install script on a server and return whether the package is now installed.

**Endpoint:** `POST /api/packages/install`
**Source:** [packages/items/commands/install.js](../back/addons/packages/items/commands/install.js)

**In:**

| Field        | Type     | Required | Notes                              |
|--------------|----------|----------|------------------------------------|
| `server`     | string   | yes      | Server id                          |
| `package`    | string   | yes      | Package id                         |
| `passphrase` | string   | no       | Agent passphrase for hash approval |

**Out:**

| Field        | Type     | Notes                    |
|--------------|----------|--------------------------|
| `installed`  | boolean  | `true` on bash exit 0    |

### packages:uninstall

Run a package's uninstall script on a server and return whether the package is still considered installed.

**Endpoint:** `POST /api/packages/uninstall`
**Source:** [packages/items/commands/uninstall.js](../back/addons/packages/items/commands/uninstall.js)

**In:** same as `packages:install`.

**Out:**

| Field        | Type     | Notes                            |
|--------------|----------|----------------------------------|
| `installed`  | boolean  | `false` on successful uninstall  |

## scripts

### scripts:run

Run a script on a server. Returns the raw agent response envelope.

**Endpoint:** `POST /api/scripts/run`
**Source:** [scripts/items/commands/run.js](../back/addons/scripts/items/commands/run.js)

**In:**

| Field        | Type     | Required | Notes                              |
|--------------|----------|----------|------------------------------------|
| `server`     | string   | yes      | Server id                          |
| `script`     | string   | yes      | Script id                          |
| `passphrase` | string   | no       | Agent passphrase for hash approval |

**Out:** response envelope from `scripts.Fn('item.run')` — `{ code, message, data }`. See [codes.md](./codes.md) for the shape of `data` per `code`.
