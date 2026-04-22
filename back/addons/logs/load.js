import logs from '#shared/logs/addon.js';

logs.Table('mesh_logs');

import './core/expose.js';
import './items/commands/crud/create.js';
import './items/commands/crud/update.js';
import './items/commands/crud/delete.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';
import './items/functions/write.js';
import './events/scripts.run.js';
import './events/scripts.approval.js';
import './events/servers.connect.js';
import './events/servers.disconnect.js';
import './events/servers.create.js';
import './events/servers.remove.js';
import './events/packages.install.js';
import './events/packages.uninstall.js';

export default logs;
