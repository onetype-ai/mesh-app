import logs from '#shared/logs/addon.js';

logs.Table('mesh_logs');

import './expose.js';
import './items/functions/write.js';
import './events/scripts.run.js';
import './events/scripts.approval.js';
import './events/servers.connect.js';
import './events/servers.disconnect.js';
import './events/packages.install.js';
import './events/packages.uninstall.js';

export default logs;
