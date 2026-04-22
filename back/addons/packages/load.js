import packages from '#shared/packages/addon.js';

packages.Table('mesh_packages');

import './core/expose.js';
import './items/commands/crud/create.js';
import './items/commands/crud/update.js';
import './items/commands/crud/delete.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';
import './items/commands/publish.js';
import './items/commands/unpublish.js';
import './core/pipelines/publish.js';
import './core/pipelines/unpublish.js';
import './core/pipelines/duplicate.js';

export default packages;
