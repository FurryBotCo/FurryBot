module.exports = {
	triggers: [
		"glomp"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Pounce onto someone lovingly~!",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		var text = this.varParse(message.c,{author:message.author,input:message.args.join(" ")});
		message.channel.send(text);
	})
};