import onetype from '@onetype/framework';

onetype.EmitOn('@error', (error) =>
{
    console.log(error);
});

onetype.EmitOn('@error.silent', (error) =>
{
    console.log(error);
});
