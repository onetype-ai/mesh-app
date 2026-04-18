import onetype from '@onetype/framework';

onetype.EmitOn('@error', (error) =>
{
    console.log(error);
});
