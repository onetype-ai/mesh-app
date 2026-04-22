import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

onetype.MiddlewareIntercept('servers.http.request', async (middleware) =>
{
    const http = middleware.value;
    const path = http.url.pathname;

    if(path.endsWith('.js') || path.endsWith('.css'))
    {
        return await middleware.next();
    }

    http.state.actor_ip    = http.user && http.user.ip    ? http.user.ip    : null;
    http.state.actor_agent = http.user && http.user.agent ? http.user.agent : null;

    let token = onetype.CookieGet('ot_session', http.request);

    if(!token)
    {
        const header = http.request.headers['authorization'] || http.request.headers['Authorization'];

        if(header && header.startsWith('Bearer '))
        {
            token = header.substring(7).trim();
        }
    }

    if(!token)
    {
        return await middleware.next();
    }

    const result = await commands.Fn('run', 'service:auth:me', { token });


    if(result.code === 200)
    {
        http.state.user = { ...result.data.user, team: result.data.team };
    }

    await middleware.next();
});
