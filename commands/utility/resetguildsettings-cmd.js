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
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: true,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
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
				ings will be reset shortly.\n(note: prefix will be **${this.config.defaultPrefix}**)`);
				try {
					await this.mdb.collection("guilds").findOneAndDelete({id: message.channel.guild.id});
					await this.mdb.collection("guilds").insertOne(Object.assign({id: message.channel.guild.id},this.config.default.guildConfig));
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