import servers from '#shared/servers/addon.js';

servers.Table('mesh_servers');
servers.Search(['name']);

import './expose.js';
import './items/servers/grpc/gateway.js';
import './events/shutdown.js';

export default servers;
