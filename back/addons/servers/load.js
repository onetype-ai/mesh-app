import servers from '#shared/servers/addon.js';

servers.Table('mesh_servers');
servers.Search(['name']);

servers.scripts.Table('mesh_servers_scripts');
servers.packages.Table('mesh_servers_packages');
servers.services.Table('mesh_servers_services');

import './core/expose.js';
import './core/expose/scripts.js';
import './core/expose/packages.js';
import './core/expose/services.js';

import './items/commands/crud/create.js';
import './items/commands/crud/update.js';
import './items/commands/crud/delete.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';
import './items/commands/scripts/attach.js';
import './items/commands/scripts/detach.js';
import './items/commands/packages/install.js';
import './items/commands/packages/uninstall.js';
import './items/commands/packages/status.js';
import './items/commands/services/deploy.js';
import './items/commands/services/destroy.js';
import './items/commands/services/start.js';
import './items/commands/services/stop.js';
import './items/commands/services/restart.js';
import './items/commands/services/status.js';
import './items/commands/ping.js';
import './items/commands/token.js';

import './core/pipelines/update.js';
import './core/pipelines/create.js';
import './core/pipelines/scripts/attach.js';
import './core/pipelines/scripts/detach.js';
import './core/pipelines/packages/install.js';
import './core/pipelines/packages/uninstall.js';
import './core/pipelines/packages/status.js';
import './core/pipelines/services/deploy.js';
import './core/pipelines/services/destroy.js';
import './core/pipelines/services/start.js';
import './core/pipelines/services/stop.js';
import './core/pipelines/services/restart.js';
import './core/pipelines/services/status.js';

export default servers;
