onetype.EmitOn('@error', (err) => 
{
    console.log(err);
})

onetype.EmitOn('@error.silent', (err) => 
{
    console.log(err);
})

onetype.AddonReady('transforms', (transforms) =>
{
	transforms.Fn('runtime');
});
