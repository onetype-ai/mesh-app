import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
    id: 'auth:logout',
    exposed: true,
    method: 'POST',
    endpoint: '/api/auth/logout',
    callback: async function(properties, resolve)
    {
        if(this.http && this.http.response)
        {
            const local = this.http.request.headers.host.startsWith('localhost');

            onetype.CookieClear('ot_session', {
                path: '/',
                domain: local ? undefined : '.' + this.http.request.headers.host.split(':')[0]
            }, this.http.response);
        }

        resolve({});
    }
});
