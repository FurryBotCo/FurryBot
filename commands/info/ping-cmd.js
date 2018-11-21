module.exports = (async (self,local) => {
	local.channel.startTyping();
	var m = await local.channel.send("Checking Ping..");
	m.edit("Ping Calculated!");
	m.delete().catch(noerr=>{});
	local.channel.send(`Bot Ping: ${(m.createdTimestamp - local.message.createdTimestamp)}ms${"\n"}API Ping: ${Math.round(self.ws.ping)}ms`);
	return local.channel.stopTyping();
});