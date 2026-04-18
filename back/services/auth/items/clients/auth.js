import commands from '@onetype/framework/commands';

commands.Fn('grpc.client', 'auth.service.onetype.ai', 443, {}, 'service:auth', false, {
    onConnect: function()
    {
        console.log('Auth service connected.');
    },
    onStreamEnd: function()
    {
        console.log('Auth service disconnected.');
    },
    onError: function(message)
    {
        console.log('Auth service error:', message);
    }
});
