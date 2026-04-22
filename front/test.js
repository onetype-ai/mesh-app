/* Test fixtures — registers a pipeline, middleware and schema on the front so they show up in docs-app crawl. */

/* ===== Schema ===== */

onetype.DataSchema('test-user', {
	id:    ['string', '', true],
	name:  ['string', '', true],
	email: ['string', ''],
	role:  {type: 'string', value: 'user', options: ['admin', 'user', 'guest']}
});

/* ===== Middleware ===== */

onetype.MiddlewareIntercept('test.flow', async (context) =>
{
	context.value.touched = true;
	await context.next();
});

onetype.MiddlewareIntercept('test.flow', async (context) =>
{
	context.value.verified = true;
	await context.next();
});

/* ===== Pipeline ===== */

onetype.Pipeline('test:hello', {
	description: 'A dummy pipeline that says hello to a user.',
	timeout: 5000,
	in: {
		user: ['string', '', true]
	},
	out: {
		greeting: ['string']
	}
})

.Join('greet', 10, {
	description: 'Build a greeting string from the user name.',
	out: {
		greeting: ['string']
	},
	callback: async (properties, resolve) =>
	{
		resolve({greeting: 'Hello, ' + properties.user + '!'});
	}
})

.Join('audit', 20, {
	description: 'Pretend to log the greeting for auditing.',
	requires: ['greeting'],
	callback: async (properties, resolve) =>
	{
		resolve(null, 'Audited', 200);
	}
})

.Test('greets alice', {
	properties: {user: 'alice'},
	code: 200,
	out: {greeting: ['string']}
});
