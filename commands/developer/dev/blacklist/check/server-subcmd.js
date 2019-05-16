module.exports = {
	triggers: [
		"server",
		"s",
		"guild",
		"g"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Check if a server is blacklisted",
	usage: "<id>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let id, srv;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		id = parseInt(message.args[0],10);
		if(isNaN(id) || id.length < 17 || id.length > 18) return message.reply(`**${id}** isn't a valid server id.`);
		srv = await this.mdb.collection("guilds").findOne({ id });
		if(!srv) {
			console.debug(`Created guild entry for ${id}`);
			await this.mdb.collection("guilds").insertOne(Object.assign(this.config.default.guildConfig,{ id }));
			srv = await this.mdb.collection("guilds").findOne({ id });
		}

		if(!srv) return message.reply(`Failed to create guild entry for **${id}**`);
		if(srv.blacklisted) return message.reply(`**${id}** is blacklisted, reason: ${srv.blacklistReason}.`);
		else return message.reply(`**${id}** is not blacklisted.`);
	})
};