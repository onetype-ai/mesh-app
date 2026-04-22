import onetype from '@onetype/framework';

const marketplace = onetype.Addon('marketplace', () => {});

import './core/pipelines/import/script.js';
import './core/pipelines/import/package.js';
import './core/pipelines/import/service.js';
import './items/commands/import/script.js';
import './items/commands/import/package.js';
import './items/commands/import/service.js';

export default marketplace;
