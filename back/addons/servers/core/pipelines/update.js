import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';

onetype.Pipeline('servers:update', {
    description: 'Update a server by id.',
    in: {
        id:   ['string|number', null, true],
        data: ['object', {}, true]
    },
    out: {
        server: ['object', null, true]
    }
})

.Join('load', 10, {
    description: 'Load the server from the database.',
    out: {
        server: ['object']
    },
    callback: async ({id}, resolve) =>
    {
        const server = await servers.Find().filter('id', id).one();

        if(!server)
        {
            return resolve(null, 'Server not found.', 404);
        }

        return {server};
    }
})

.Join('validate', 20, {
    description: 'Filter only editable fields and validate against schema.',
    requires: ['server'],
    out: {
        allowed: ['object']
    },
    callback: async ({data}) =>
    {
        const whitelist = ['name'];
        const allowed   = {};

        whitelist.forEach(key =>
        {
            if(data[key] !== undefined)
            {
                allowed[key] = data[key];
            }
        });

        return {allowed};
    }
})

.Join('save', 30, {
    description: 'Apply changes and persist to database.',
    requires: ['server', 'allowed'],
    callback: async ({server, allowed}) =>
    {
        server.SetData(allowed);

        await server.Update({whitelist: Object.keys(allowed)});
    },
    rollback: async ({server}) =>
    {
        if(server)
        {
            await server.Reload();
        }
    }
})

.Join('respond', 40, {
    description: 'Return fresh item data.',
    requires: ['server'],
    out: {
        server: ['object', null, true]
    },
    callback: async ({server}) =>
    {
        return {server: server.data};
    }
})

.Test('missing id', {
    properties: {},
    code: 400
})

.Test('unknown id', {
    properties: {id: 'nonexistent-id', data: {name: 'x'}},
    code: 404
});
