onetype.EmitOn('@error', (err) => 
{
    console.log(err);
})

onetype.AddonReady('transforms', (transforms) =>
{
	transforms.Fn('runtime');
});
