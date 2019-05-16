module.exports = {
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Check if a user is blacklisted",
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
		let u, id, usr;
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
		if(usr.blacklisted) return message.reply(`**${u.username}#${u.discriminator}** (${id}) is blacklisted, reason: ${usr.blacklistReason}.`);
		else return message.reply(`**${u.username}#${u.discriminator}** (${id}) is not blacklisted.`);
	})
};