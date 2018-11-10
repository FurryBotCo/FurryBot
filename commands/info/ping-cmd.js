module.exports = (async (self,local) => {
	Object.assign(self,local);
	var m = await self.channel.send("Checking Ping..");
	m.edit("Ping Calculated!");
	m.delete().catch(noerr=>{});
	self.channel.send(`Bot Ping: ${(m.createdTimestamp - self.message.createdTimestamp)}ms${"\n"}API Ping: ${Math.round(self.ws.ping)}ms`);
});