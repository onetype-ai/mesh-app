import html from '@onetype/framework/html';

html.Item({
    id: 'icons',
    tag: 'link',
    position: 'head',
    order: 90,
    attributes: {
        rel: 'stylesheet',
        defer: true,
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300,0,0'
    }
});
