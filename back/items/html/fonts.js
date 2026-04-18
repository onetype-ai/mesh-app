import html from '@onetype/framework/html';

html.Item({
    id: 'fonts',
    tag: 'link',
    position: 'head',
    order: 85,
    attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap'
    }
});
