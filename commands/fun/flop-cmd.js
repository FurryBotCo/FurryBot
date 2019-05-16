module.exports = {
	triggers: [
		"flop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Flop onto someone! OwO",
	usage: "<@member/string>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let input, text;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input});
		message.channel.createMessage(text);
	})
};