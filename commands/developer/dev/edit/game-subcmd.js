module.exports = {
	triggers: [
		"game"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots game",
	usage: "<type> <game>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		if(message.args.length <= 1) return new Error("ERR_INVALID_USAGE");
		let type;
		switch(message.args[0].toLowerCase()) {
		case "playing":
		case 0:
			type = 0;
			break;

		case "streaming":
		case 1:
			type = 1;
			break;

		case "listening":
		case 2:
			type = 2;
			break;

		case "watching":
		case 3:
			type = 3;
			break;

		default:
			return message.channel.createMessage(`<@!${message.author.id}>, invalid type. Possible types: **playing**, **listening**, **watching**, **streaming**.`);
		}
		let status = this.bot.guilds.filter(g => g.members.has(this.bot.user.id))[0].members.get(this.bot.user.id).status;
		if(!status) status = "online";

		if(type === 1) return this.bot.editStatus(status,{ url: message.args.shift(), name: message.args.join(" "), type });
		else return this.bot.editStatus(status,{ name: message.args.join(" "), type });
		// this.bot.editStatus("online", { name: message.args.join(" "),type })
	})
};