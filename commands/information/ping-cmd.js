module.exports = {
	triggers: [
		"ping",
		"pong"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	description: "Get the bots ping",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let m = await message.channel.createMessage("Checking Ping..");
		m.edit("Ping Calculated!");
		m.delete().catch(noerr => null);
		return message.channel.createMessage(`Client Ping: ${(m.timestamp - message.timestamp)}ms${"\n"}Shard Ping: ${Math.round(message.guild.shard.latency)}ms`);
	})
};