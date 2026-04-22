import './env.js';

import onetype from '@onetype/framework';
import database from '@onetype/framework/database';

/* Services */
import '#auth/load.js';

/* Addons */
import '#servers/load.js';
import '#scripts/load.js';
import '#approvals/load.js';
import '#packages/load.js';
import '#logs/load.js';
import '#gateways/load.js';
import '#services/load.js';

/* Items */
import './items/database/primary.js';

/* Wait for DB */
await database.Fn('connect');

const summary = await onetype.PipelineTests();

summary.pipelines.forEach(pipeline =>
{
    console.log('\n' + pipeline.name + ' — ' + pipeline.passed + '/' + pipeline.total + ' (' + pipeline.percent + '%)');

    pipeline.results.forEach(r =>
    {
        console.log(' ' + (r.passed ? '✓' : '✗') + ' ' + r.name + ' (code=' + r.code + ')');

        if(!r.passed)
        {
            console.log('   ' + r.message);
        }
    });
});

console.log('\n─── TOTAL: ' + summary.passed + '/' + summary.total + ' passed, ' + summary.failed + ' failed (' + summary.percent + '%) ───');

process.exit(summary.failed > 0 ? 1 : 0);
