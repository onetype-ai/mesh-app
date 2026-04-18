import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
    id: 'auth:user',
    exposed: true,
    method: 'PUT',
    endpoint: '/api/auth/user',
    in: {
        name: ['string']
    },
    out: {
        user: ['object', null, true]
    },
    callback: async function(properties, resolve)
    {
        const token = onetype.CookieGet('ot_session', this.http.request);

        if(!token)
        {
            return resolve(null, 'Not authenticated.', 401);
        }

        const me = await commands.Fn('run', 'service:auth:me', { token });

        if(me.code !== 200)
        {
            return resolve(null, me.message, me.code);
        }

        const result = await commands.Fn('run', 'service:auth:users:update', {
            id: me.data.user.id,
            name: properties.name
        });

        if(result.code !== 200)
        {
            return resolve(null, result.message, result.code);
        }

        resolve({ user: { ...result.data.user, team: me.data.team } });
    }
});
