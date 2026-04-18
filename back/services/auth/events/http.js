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

    const token = onetype.CookieGet('ot_session', http.request) || http.request.headers.authorization;

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
