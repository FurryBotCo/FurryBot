module.exports = {
	triggers: [
		"flop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Flop onto someone! OwO",
	usage: "<@member/string>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let input, text;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input});
		message.channel.createMessage(text);
	})
};