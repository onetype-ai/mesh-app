import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
    id: 'auth:me',
    exposed: true,
    method: 'GET',
    endpoint: '/api/auth/me',
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

        const result = await commands.Fn('run', 'service:auth:me', { token });

        if(result.code !== 200)
        {
            return resolve(null, result.message, result.code);
        }

        resolve({ user: { ...result.data.user, team: result.data.team } });
    }
});
