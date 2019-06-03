const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../../../modules/CommandRequire");

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
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let u, id, usr, embed;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		u = await message.getUserFromArgs();
		if(!u) return message.reply(`**${message.args[0]}** isn't a valid user.`);
		id = u.id;
		usr = await mdb.collection("users").findOne({ id });
		if(!usr) {
			console.debug(`Created user entry for ${id}`);
			await mdb.collection("users").insertOne(Object.assign(config.default.userConfig,{ id }));
			usr = await mdb.collection("users").findOne({ id });
		}

		if(!usr) return message.reply(`Failed to create user entry for **${id}**`);
		if(!usr.blacklisted) return message.reply(`**${id}** is not blacklisted`);
		else {
			await mdb.collection("users").findOneAndUpdate({ id },{ $set: { blacklisted: false, blacklistReason: null }});
			embed = {
				title: "User Unblacklisted",
				description: `Id: ${id}\nTag: ${u.username}#${u.discriminator}\nPrevious Reason: ${usr.blacklistReason}\nBlame: ${message.author.username}#${message.author.discriminator}`
			};
			Object.assign(embed,message.embed_defaults());
			await this.bot.executeWebhook(config.webhooks.logs.id,config.webhooks.logs.token,{ embeds: [ embed ], username: `Blacklist Logs${config.beta ? " - Beta" : ""}` });
			return message.reply(`Removed **${u.username}#${u.discriminator}** (${id}) from the blacklist, previous reason: ${usr.blacklistReason}.`);
		}
	})
};