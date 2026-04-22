import gateways from '#shared/gateways/addon.js';

gateways.Table('mesh_gateways');

import './core/expose.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';

export default gateways;
