module.exports = {
	triggers: [
		"pet"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Pet someone ^w^",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let input, text;
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input:input});
		message.channel.send(text);
	})
};