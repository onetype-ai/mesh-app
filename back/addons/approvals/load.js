import approvals from '#shared/approvals/addon.js';

approvals.Table('mesh_approvals');

import './core/expose.js';
import './items/commands/crud/create.js';
import './items/commands/crud/update.js';
import './items/commands/crud/delete.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';

export default approvals;
