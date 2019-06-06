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
		"server",
		"s",
		"guild",
		"g"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Removes an entry from the bots server blacklist",
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
		let id, srv, embed;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		id = message.args[0];
		if(id.length < 17 || id.length > 18) return message.reply(`**${id}** isn't a valid server id.`);
		srv = await mdb.collection("guilds").findOne({ id });
		if(!srv) {
			console.debug(`Created guild entry for ${id}`);
			await mdb.collection("guilds").insertOne(Object.assign(config.defaults.guildConfig,{ id }));
			srv = await mdb.collection("guilds").findOne({ id });
		}

		if(!srv) return message.reply(`Failed to create guild entry for **${id}**`);
		if(!srv.blacklisted) return message.reply(`**${id}** is not blacklisted.`);
		else {
			await mdb.collection("guilds").findOneAndUpdate({ id },{ $set: { blacklisted: false }});
			embed = {
				title: "Server Unblacklisted",
				description: `Id: ${id}\nPrevious Blacklist Reason: ${srv.blacklistReason}\nBlame: ${message.author.username}#${message.author.discriminator}`
			};
			Object.assign(embed,message.embed_defaults());
			await this.bot.executeWebhook(config.webhooks.logs.id,config.webhooks.logs.token,{ embeds: [ embed ], username: `Blacklist Logs${config.beta ? " - Beta" : ""}` });
			return message.reply(`Removed **${id}** from the blacklist, previous reason: ${srv.blacklistReason}.`);
		}
	})
};