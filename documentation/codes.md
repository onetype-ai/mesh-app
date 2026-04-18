# Codes

Every `agent.exec` response envelope carries a `code`. `scripts.Fn('item.run', item, server)` returns the full envelope: `{ code, message, data }`. This is the canonical list.

| Code | Source  | Data shape               | Message                 |
|------|---------|--------------------------|-------------------------|
| 200  | Agent   | `{stdout, stderr, code}` | `ok`                    |
| 400  | Agent   | `null`                   | `Command is required.`  |
| 401  | Agent   | `{hash}`                 | `Not approved.`         |
| 503  | Gateway | `{}`                     | `Server not connected.` |

## Log level mapping

Applied by [back/addons/logs/events/scripts.run.js](../back/addons/logs/events/scripts.run.js):

| Condition                                   | Level   |
|---------------------------------------------|---------|
| envelope `200` + bash `0` + no `stderr`     | `Info`  |
| envelope `200` + bash `0` + has `stderr`    | `Warn`  |
| envelope `200` + bash `!= 0`                | `Error` |
| envelope `401`                              | `Warn`  |
| anything else                               | `Error` |
