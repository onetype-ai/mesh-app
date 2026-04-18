import { createHash } from 'crypto';
import scripts from '#shared/scripts/addon.js';

scripts.Table('mesh_scripts');

/* ===== Auto-hash bash on set (back-only) ===== */
scripts.Field('bash', ['string', null, true], null, (value, prevValue, item) =>
{
	item.Set('hash', createHash('sha256').update(value || '').digest('hex'));
	return value;
});

import './expose.js';
import './functions/schema.js';
import './item/functions/run.js';
import './items/commands/run.js';
import './events/ready.js';
import './events/servers.add.js';
import './events/approval.js';

export default scripts;
