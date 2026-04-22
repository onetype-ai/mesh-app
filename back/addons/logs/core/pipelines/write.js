import crypto from 'crypto';
import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.Pipeline('logs:write', {
	description: 'Write a log with dedup — if same hash exists in the same 1h bucket for the team, increment hit_count and refresh output/updated_at. Otherwise insert a new log.',
	in: {
		team_id:        ['string', null, true],
		user:           ['object'],
		actor_ip:       ['string'],
		actor_agent:    ['string'],
		correlation_id: ['string'],
		action:         ['string', null, true],
		level:          ['string', 'Info'],
		target_type:    ['string'],
		target_id:      ['string'],
		reference_type: ['string'],
		reference_id:   ['string'],
		code:           ['number'],
		time:           ['number'],
		output:         ['object', {}]
	},
	out: {
		log: ['object', null, true]
	}
})

.Join('sanitize', 10, {
	description: 'Truncate every string in output to 8KB to keep payloads predictable.',
	out: {
		clean: ['object']
	},
	callback: async ({ output }) =>
	{
		const limit = 8192;
		const source = output && typeof output === 'object' ? output : {};
		const clean = {};

		for(const [key, value] of Object.entries(source))
		{
			if(typeof value === 'string' && value.length > limit)
			{
				clean[key] = value.slice(0, limit) + '…[truncated]';
			}
			else
			{
				clean[key] = value;
			}
		}

		return { clean };
	}
})

.Join('hash', 20, {
	description: 'Compute a dedup hash. Error logs include output in the hash so distinct errors stay separate; success logs hash only structural fields so repeated successes collapse.',
	requires: ['clean'],
	out: {
		hash: ['string']
	},
	callback: async ({ team_id, user, action, level, target_type, target_id, reference_type, reference_id, code, clean }) =>
	{
		const bucket = Math.floor(Date.now() / 3600000);
		const isError = (typeof code === 'number' && code !== 0 && code !== 200) || level === 'Error' || level === 'Warn';

		const parts = [
			team_id,
			user && user.id ? user.id : '',
			action,
			level,
			target_type || '',
			target_id    || '',
			reference_type || '',
			reference_id   || '',
			typeof code === 'number' ? code : '',
			bucket
		];

		if(isError)
		{
			parts.push(JSON.stringify(clean));
		}

		const hash = crypto.createHash('sha256').update(parts.join('|')).digest('hex');

		return { hash };
	}
})

.Join('existing', 30, {
	description: 'Look up an active log with the same hash for this team in the current bucket.',
	requires: ['hash'],
	out: {
		existing: ['object']
	},
	callback: async ({ team_id, hash }) =>
	{
		const existing = await logs.Find()
			.filter('team_id', team_id)
			.filter('hash', hash)
			.filter('deleted_at', null, 'NULL')
			.one();

		return { existing: existing || null };
	}
})

.Join('increment', 40, {
	description: 'If an existing log was found, bump its hit_count and refresh output/updated_at.',
	requires: ['existing', 'clean'],
	when: ({ existing }) => !!existing,
	out: {
		log: ['object']
	},
	callback: async ({ existing, clean }) =>
	{
		existing.Set('hit_count', existing.Get('hit_count') + 1);
		existing.Set('output', clean);

		await existing.Update();

		return { log: existing };
	}
})

.Join('create', 50, {
	description: 'Otherwise create a new log row with hit_count 1.',
	requires: ['clean', 'hash'],
	when: ({ existing }) => !existing,
	out: {
		log: ['object']
	},
	callback: async ({ team_id, user, actor_ip, actor_agent, correlation_id, action, level, target_type, target_id, reference_type, reference_id, code, time, clean, hash }) =>
	{
		const log = logs.Item({
			team_id,
			user:           user || null,
			actor_ip:       actor_ip || null,
			actor_agent:    actor_agent || null,
			correlation_id: correlation_id || null,
			action,
			level,
			target_type:    target_type || null,
			target_id:      target_id || null,
			reference_type: reference_type || null,
			reference_id:   reference_id || null,
			code:           typeof code === 'number' ? code : null,
			time:           typeof time === 'number' ? time : null,
			output:         clean,
			hash,
			hit_count:      1
		});

		await log.Create();

		return { log };
	}
});
