import onetype from '@onetype/framework';

const scripts = onetype.Addon('scripts', (scripts) =>
{
	scripts.Table('mesh_scripts');

	scripts.Field('id', ['string', null, true]);
	scripts.Field('team_id', ['string', null, true]);
	scripts.Field('service_id', ['string']);
	scripts.Field('server_id', ['string']);
	scripts.Field('package_id', ['string']);
	scripts.Field('name', ['string']);
	scripts.Field('description', ['string']);

	scripts.Field('status',
	{
		type: 'string',
		value: 'Draft',
		required: true,
		options: ['Draft', 'Published']
	});

	scripts.Field('platforms',
	{
		type: 'array',
		value: ['*'],
		each:
		{
			type: 'string',
			options: ['*', 'linux', 'darwin']
		}
	});

	scripts.Field('is_marketplace', ['boolean', false]);
	scripts.Field('is_global', ['boolean', false]);
	scripts.Field('autorun', ['boolean', false]);
	scripts.Field('loop', ['number']);

	scripts.Field('output',
	{
		type: 'string',
		value: 'raw',
		options: ['raw', 'json']
	});

	scripts.Field('bash', ['string', null, true]);
	scripts.Field('hash', ['string']);

	scripts.Field('metrics',
	{
		type: 'array',
		value: [],
		each:
		{
			type: 'object',
			config:
			{
				id: ['string', null, true],
				label: ['string'],
				description: ['string'],
				widget:
				{
					type: 'string',
					value: 'text',
					required: true,
					options: ['text', 'number', 'progress', 'badge', 'gauge', 'line', 'list']
				},
				unit:
				{
					type: 'string',
					options: ['', '%', 'ms', 's', 'bytes', 'KB', 'MB', 'GB', 'TB', 'count', 'req/s', 'ops/s']
				},
				value:
				{
					type: 'string',
					value: 'scalar',
					options: ['scalar', 'object', 'array']
				},
				key: ['string', null, true],
				fields:
				{
					type: 'array',
					value: [],
					each:
					{
						type: 'object',
						config:
						{
							key: ['string', null, true],
							label: ['string'],
							unit: ['string']
						}
					}
				},
				states: ['object', {}]
			}
		}
	});
});

export default scripts;
