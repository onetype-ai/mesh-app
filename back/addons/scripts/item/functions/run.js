import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';

scripts.Fn('item.run', async function(item, server)
{
	this.time = Date.now();

	this.exec = async function()
	{
		const exec = server.Get('exec');

		if(typeof exec !== 'function')
		{
			return { code: 503, message: 'Server not connected.', data: {} };
		}

		return await exec(item.Get('bash'));
	};

	this.parse = function(payload)
	{
		if(item.Get('output') !== 'json')
		{
			return;
		}

		try
		{
			payload.json = JSON.parse(payload.stdout);
		}
		catch(error)
		{
			payload.json = null;
			payload.stderr = (payload.stderr ? payload.stderr + '\n' : '') + error.message;
		}
	};

	await onetype.Middleware('scripts.run.before', { server, script: item });

	const result = await this.exec();

	if(result.code === 401)
	{
		onetype.Emit('scripts.approval', { server, script: item, result });
	}

	if(result.code === 200)
	{
		this.parse(result.data);
	}

	await onetype.Middleware('scripts.run.after', { server, script: item, result });

	onetype.Emit('scripts.run', { server, script: item, result, time: Date.now() - this.time });

	return result;
});
