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

    try
    {
        let token = onetype.CookieGet('ot_session', http.request);

        if(!token)
        {
            const header = http.request.headers['authorization'] || http.request.headers['Authorization'];

            if(header && header.startsWith('Bearer '))
            {
                token = header.substring(7).trim();
            }
        }

        if(token)
        {
            const result = await commands.Fn('run', 'service:auth:me', { token });

            if(result.code === 200)
            {
                http.state.user = { ...result.data.user, team: result.data.team };
            }
        }
    }
    catch(error)
    {
        console.error('[auth http middleware]', path, error);
    }

    await middleware.next();
});
