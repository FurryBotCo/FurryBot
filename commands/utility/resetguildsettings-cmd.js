const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"reset",
		"resetguild",
		"resetsettings",
		"resetguildsettings"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 36e5,
	description: "Reset guild settings",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: true,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let choice;
		message.channel.createMessage("this will erase ALL guild (server) settings, are you sure you want to do this?\nType **yes** or **no**.");
		const d = await this.MessageCollector.awaitMessage(message.channel.id, message.author.id, 6e4);
		if(!d || !["yes","no"].some(c => d.content.toLowerCase() === c)) return message.channel.createMessage(`<@!${message.author.id}>, that wasn't a valid option..`);
		message.channel.awaitMessages(m => ["yes","no"].includes(m.content.toLowerCase()) && m.author.id === message.author.id,{max:1,time:6e4,errors:["time"]}).then(async(m) => {
			choice = m.first().content.toLowerCase() === "yes" ? true : false;
			if(!choice) {
				return message.channel.createMessage("Canceled reset.");
			} else {
				await message.channel.createMessage(`All guild sett
				ings will be reset shortly.\n(note: prefix will be **${config.defaultPrefix}**)`);
				try {
					await mdb.collection("guilds").findOneAndDelete({id: message.channel.guild.id});
					await mdb.collection("guilds").insertOne(Object.assign({id: message.channel.guild.id},config.defaults.guildConfig));
				}catch(e) {
					this.logger.error(e);
					return message.channel.createMessage("There was an internal error while doing this");
				}
			}
		}).catch((e) => {
			this.logger.error(e);
			return message.channel.createMessage("An unknown error occured, please contact the bot owner.");
		});
		return;
	})
};