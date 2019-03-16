module.exports = {
	triggers: [
		"dictionary",
		"dict"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Throw a dictionary at someone to teach them some knowledge!",
	usage: "<@member/text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let input, text;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input:input});
		message.channel.send(text);
	})
};