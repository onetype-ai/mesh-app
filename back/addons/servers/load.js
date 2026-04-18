import servers from '#shared/servers/addon.js';

servers.Table('mesh_servers');
servers.Search(['name', 'ip']);

import './expose.js';
import './items/servers/grpc/gateway.js';

export default servers;
