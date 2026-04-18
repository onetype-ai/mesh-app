import './env.js';
import './config.js';

import commands from '@onetype/framework/commands';
import database from '@onetype/framework/database';

/* Services */
import '#auth/load.js';

/* Addons */
import '#servers/load.js';
import '#scripts/load.js';
import '#approvals/load.js';
import '#packages/load.js';
import '#logs/load.js';

/* Items */
import './items/assets/assets.js';
import './items/database/primary.js';
import './items/commands/health.js';
import './items/commands/html.js';
import './items/html/fonts.js';
import './items/html/icons.js';

/* Servers */
import './items/servers/http.js';

/* Expose */
commands.Fn('expose', 'commands:run', '/api/commands/run');