import logs from '#shared/logs/addon.js';

logs.Table('mesh_logs');

import './core/expose.js';
import './core/pipelines/write.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';

import './core/events/pipelines/servers.create.js';
import './core/events/pipelines/servers.update.js';
import './core/events/pipelines/servers.scripts.attach.js';
import './core/events/pipelines/servers.scripts.detach.js';
import './core/events/pipelines/servers.packages.install.js';
import './core/events/pipelines/servers.packages.uninstall.js';
import './core/events/pipelines/servers.packages.status.js';
import './core/events/pipelines/servers.services.deploy.js';
import './core/events/pipelines/servers.services.destroy.js';
import './core/events/pipelines/servers.services.start.js';
import './core/events/pipelines/servers.services.stop.js';
import './core/events/pipelines/servers.services.restart.js';
import './core/events/pipelines/servers.services.status.js';
import './core/events/pipelines/scripts.publish.js';
import './core/events/pipelines/packages.publish.js';
import './core/events/pipelines/services.publish.js';
import './core/events/pipelines/marketplace.import.script.js';
import './core/events/pipelines/marketplace.import.package.js';
import './core/events/pipelines/marketplace.import.service.js';
import './core/events/pipelines/agents.connect.js';
import './core/events/pipelines/agents.disconnect.js';

export default logs;
