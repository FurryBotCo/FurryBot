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
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		var input = message.args.join(" ");
		var text = this.varParse(message.c,{author:message.author,input:input});
		message.channel.send(text);
	})
};