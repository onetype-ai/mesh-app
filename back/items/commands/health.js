import commands from '@onetype/framework/commands';

commands.Item({
    id: 'health',
    exposed: true,
    method: 'GET',
    endpoint: '/health',
    out: {
        uptime: ['number', null, true]
    },
    callback: async function(properties, resolve)
    {
        resolve({
            uptime: process.uptime()
        });
    }
});
