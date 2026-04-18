# Events

Mesh-specific emits and middleware. Framework events (`@pages.*`, `@servers.http.*`, `shutdown`, etc.) are not listed here.

Names without the `@` prefix are Mesh events. The `@` prefix is reserved for framework events.

## servers

### Emits

| Event                 | Payload              | Emitted from                                                                                  |
|-----------------------|----------------------|-----------------------------------------------------------------------------------------------|
| `servers.connect`     | `{server, stream}`   | [servers/items/servers/grpc/gateway.js](../back/addons/servers/items/servers/grpc/gateway.js) |
| `servers.disconnect`  | `{server, stream}`   | [servers/items/servers/grpc/gateway.js](../back/addons/servers/items/servers/grpc/gateway.js) |

## scripts

### Emits

| Event               | Payload                                          | Emitted from                                                                        |
|---------------------|--------------------------------------------------|-------------------------------------------------------------------------------------|
| `scripts.run`       | `{server, script, result, time}`                 | [scripts/item/functions/run.js](../back/addons/scripts/item/functions/run.js)       |
| `scripts.approval`  | `{server, script, result}`                       | [scripts/item/functions/run.js](../back/addons/scripts/item/functions/run.js)       |

### Middleware

| Event                  | Payload                        | Invoked from                                                                        |
|------------------------|--------------------------------|-------------------------------------------------------------------------------------|
| `scripts.run.before`   | `{server, script}`             | [scripts/item/functions/run.js](../back/addons/scripts/item/functions/run.js)       |
| `scripts.run.after`    | `{server, script, result}`     | [scripts/item/functions/run.js](../back/addons/scripts/item/functions/run.js)       |

## packages

### Emits

| Event                 | Payload                                      | Emitted from                                                           |
|-----------------------|----------------------------------------------|------------------------------------------------------------------------|
| `packages.install`    | `{server, package, code, result, time}`      | [packages/functions/install.js](../back/addons/packages/functions/install.js)     |
| `packages.uninstall`  | `{server, package, code, result, time}`      | [packages/functions/uninstall.js](../back/addons/packages/functions/uninstall.js) |

### Middleware

| Event                         | Payload                         | Invoked from                                                                      |
|-------------------------------|---------------------------------|-----------------------------------------------------------------------------------|
| `packages.install.before`     | `{server, package}`             | [packages/functions/install.js](../back/addons/packages/functions/install.js)     |
| `packages.install.after`      | `{server, package, result}`     | [packages/functions/install.js](../back/addons/packages/functions/install.js)     |
| `packages.uninstall.before`   | `{server, package}`             | [packages/functions/uninstall.js](../back/addons/packages/functions/uninstall.js) |
| `packages.uninstall.after`    | `{server, package, result}`     | [packages/functions/uninstall.js](../back/addons/packages/functions/uninstall.js) |
