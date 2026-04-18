import commands from '@onetype/framework/commands';
import html from '@onetype/framework/html';

commands.Item({
    id: 'html',
    exposed: true,
    method: 'GET',
    endpoint: '*',
    type: 'HTML',
    callback: async function(properties, resolve)
    {
        resolve(html.Fn('render', {
            head: () => `<script>window.__STATE__ = ${JSON.stringify({ ...global.__STATE__, ...this.http.state })};</script>`
        }));
    }
});
