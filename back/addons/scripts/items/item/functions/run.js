import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';

scripts.Fn('item.run', async function(item, server)
{
	/* ===== Resolve exec ===== */
	const exec = server.Get('exec');

	if(typeof exec !== 'function')
	{
		return { code: 503, message: 'Server not connected.' };
	}

	/* ===== Send bash to agent, get raw result ===== */
	const bash = item.Get('bash');
	const result = await exec(bash);

	/* ===== Not approved → emit event, skip processing ===== */
	if(result.code === 401)
	{
		onetype.Emit('@scripts.approval.needed', {
			server,
			script: item,
			hash: result.data && result.data.hash
		});

		return result;
	}

	if(result.code !== 200)
	{
		return result;
	}

	const payload = result.data;

	/* ===== Parse output ===== */
	if(item.Get('output') === 'json')
	{
		try
		{
			payload.json = JSON.parse(payload.stdout);
		}
		catch(error)
		{
			payload.json = null;
			payload.stderr = (payload.stderr ? payload.stderr + '\n' : '') + error.message;
		}
	}

	/* ===== Validate against script.metrics schema, merge into server.metrics ===== */
	if(payload.json && typeof payload.json === 'object')
	{
		const { values, missing } = scripts.Fn('schema', item, payload.json);

		if(missing.length)
		{
			console.warn('Script missing keys:', item.Get('name'), missing);
		}

		const metrics = { ...(server.Get('metrics') || {}), ...values };

		server.Set('metrics', metrics);
		await server.Update();
	}

	return payload;
});
