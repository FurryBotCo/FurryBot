module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	var m = await message.channel.send("Checking Ping..");
	m.edit("Ping Calculated!");
	m.delete().catch(noerr=>{});
	message.channel.send(`Bot Ping: ${(m.createdTimestamp - message.createdTimestamp)}ms${"\n"}API Ping: ${Math.round(client.ws.ping)}ms`);
});