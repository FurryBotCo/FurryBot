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
	run: (async(message) => {
		let text;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		text = message.client.varParse(message.c,{author:message.author,input:message.args.join(" ")});
		message.channel.send(text);
	})
};