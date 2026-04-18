import packages from '#shared/packages/addon.js';

packages.Table('mesh_packages');

import './expose.js';
import './functions/install.js';
import './functions/uninstall.js';
import './items/commands/install.js';
import './items/commands/uninstall.js';

export default packages;
