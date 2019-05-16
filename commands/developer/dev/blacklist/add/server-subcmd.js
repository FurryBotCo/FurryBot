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
	description: "Add an entry to the bots server blacklist",
	usage: "<id> [reason]",
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
		let id, blacklistReason, srv, embed;
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
		if(srv.blacklisted) return message.reply(`**${id}** is already blacklisted, reason: ${srv.blacklistReason}.`);
		else {
			blacklistReason = message.args.length > 1 ? message.args.slice(1,message.args.length).join(" ") : "No Reason Specified";
			await this.mdb.collection("guilds").findOneAndUpdate({ id },{ $set: { blacklisted: true, blacklistReason }});
			embed = {
				title: "Server Blacklisted",
				description: `Id: ${id}\nReason: ${blacklistReason}\nBlame: ${message.author.username}#${message.author.discriminator}`
			};
			Object.assign(embed,message.embed_defaults());
			await this.bot.executeWebhook(this.config.webhooks.logs.id,this.config.webhooks.logs.token,{ embeds: [ embed ], username: `Blacklist Logs${this.config.beta ? " - Beta" : ""}` });
			return message.reply(`Added **${id}** to the blacklist, reason: ${blacklistReason}.`);
		}
	})
};