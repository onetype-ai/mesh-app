import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
    id: 'auth:register',
    exposed: true,
    method: 'POST',
    endpoint: '/api/auth/register',
    in: {
        email: ['string', null, true],
        password: ['string', null, true],
        name: ['string', null, true]
    },
    out: {
        team: ['object', null, true],
        user: ['object', null, true]
    },
    callback: async function(properties, resolve)
    {
        const result = await commands.Fn('run', 'service:auth:register', {
            email: properties.email,
            password: properties.password,
            name: properties.name
        });

        if(result.code !== 200)
        {
            return resolve(null, result.message, result.code);
        }

        const login = await commands.Fn('run', 'service:auth:login', {
            email: properties.email,
            password: properties.password
        });

        if(login.code === 200 && this.http && this.http.response)
        {
            const host = this.http.request.headers.host;
            const local = host.startsWith('localhost');

            onetype.CookieSet('ot_session', login.data.token, {
                path: '/',
                domain: local ? undefined : '.' + host.split(':')[0],
                secure: !local,
                maxAge: 86400 * 14,
                sameSite: 'Lax'
            }, this.http.response);
        }

        resolve(result.data);
    }
});
