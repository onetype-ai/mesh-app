import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:create',
	in: {
		name: ['string', null, true],
		scripts: { type: 'array', value: [], each: ['string'] },
		packages: { type: 'array', value: [], each: ['string'] },
		services: { type: 'array', value: [], each: ['string'] }
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:create', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Server created.', type: 'success' });
		$ot.page('/servers/' + data.id + '/setup');

		resolve(data);
	}
});
