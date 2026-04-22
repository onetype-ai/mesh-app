import { createHash } from 'crypto';
import scripts from '#shared/scripts/addon.js';

scripts.Table('mesh_scripts');

/* ===== Auto-hash bash on set (back-only) ===== */
scripts.Field('bash', ['string', null, true], null, (value, prevValue, item) =>
{
	item.Set('hash', createHash('sha256').update(value || '').digest('hex'));
	return value;
});

import './core/expose.js';
import './items/commands/crud/create.js';
import './items/commands/crud/update.js';
import './items/commands/crud/delete.js';
import './items/commands/crud/one.js';
import './items/commands/crud/many.js';
import './items/commands/publish.js';
import './items/commands/unpublish.js';
import './core/pipelines/publish.js';
import './core/pipelines/duplicate.js';

export default scripts;
