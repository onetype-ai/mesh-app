# Commands

Mesh-specific HTTP commands. Framework commands (`commands:run`, `commands:get:*`, `pages:change`, etc.) and auth commands (`auth:login`, `auth:register`, ...) are not listed here.

All endpoints are `POST` unless noted. Responses follow the standard envelope `{ data, message, code, time }`.

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
