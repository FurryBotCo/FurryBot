module.exports = {
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Remove an entry from the bots user blacklist",
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
		let u, id, usr, embed;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		u = await message.getUserFromArgs();
		if(!u) return message.reply(`**${message.args[0]}** isn't a valid user.`);
		id = u.id;
		usr = await this.mdb.collection("user").findOne({ id });
		if(!usr) {
			console.debug(`Created user entry for ${id}`);
			await this.mdb.collection("users").insertOne(Object.assign(this.config.default.userConfig,{ id }));
			usr = await this.mdb.collection("users").findOne({ id });
		}

		if(!usr) return message.reply(`Failed to create user entry for **${id}**`);
		if(!usr.blacklisted) return message.reply(`**${id}** is not blacklisted`);
		else {
			await this.mdb.collection("users").findOneAndUpdate({ id },{ $set: { blacklisted: false, blacklistReason: null }});
			embed = {
				title: "User Unblacklisted",
				description: `Id: ${id}\nTag: ${u.username}#${u.discriminator}\nPrevious Reason: ${usr.blacklistReason}\nBlame: ${message.author.username}#${message.author.discriminator}`
			};
			Object.assign(embed,message.embed_defaults());
			await this.bot.executeWebhook(this.config.webhooks.logs.id,this.config.webhooks.logs.token,{ embeds: [ embed ], username: `Blacklist Logs${this.config.beta ? " - Beta" : ""}` });
			return message.reply(`Removed **${u.username}#${u.discriminator}** (${id}) from the blacklist, previous reason: ${usr.blacklistReason}.`);
		}
	})
};