import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
    id: 'auth:login',
    exposed: true,
    method: 'POST',
    endpoint: '/api/auth/login',
    in: {
        email: ['string', null, true],
        password: ['string', null, true]
    },
    out: {
        token: ['string', null, true],
        type: ['string', null, true],
        expiry: ['number', null, true]
    },
    callback: async function(properties, resolve)
    {
        const result = await commands.Fn('run', 'service:auth:login', {
            email: properties.email,
            password: properties.password
        });

        if(result.code !== 200)
        {
            return resolve(null, result.message, result.code);
        }

        if(this.http && this.http.response)
        {
            const host = this.http.request.headers.host;
            const local = host.startsWith('localhost');

            onetype.CookieSet('ot_session', result.data.token, {
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
