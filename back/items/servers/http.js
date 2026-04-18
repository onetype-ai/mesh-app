import commands from '@onetype/framework/commands';

commands.Fn('http.server', 3020, {
    onStart: () =>
    {
        console.log('Travel running on :3020');
    },
    onRequest: (http) =>
    {
        const origin = http.request.headers['origin'];

        if(origin)
        {
            http.response.setHeader('Access-Control-Allow-Origin', origin);
            http.response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
            http.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        }

        if(http.request.method === 'OPTIONS')
        {
            http.response.writeHead(204);
            http.response.end();
            http.prevent = true;
        }
    }
});
