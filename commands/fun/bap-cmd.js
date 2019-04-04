module.exports = {
	triggers: [
		"bap"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Bap someone! Ouch!",
	usage: "<@member/text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let input, text;
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsOf(this.bot.user.id).has("attachFiles") /* 32768 */) return message.channel.createMessage(`<@!${message.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
			message.channel.createMessage(text,{
				file: await this.getImageFromURL("https://assets.furry.bot/bap.gif"),
				name: "bap.gif"
			});
		} else {
			message.channel.createMessage(text);
		}
	})
};