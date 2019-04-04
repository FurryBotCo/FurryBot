module.exports = {
	triggers: [
		"kiss"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Kiss someone o.o",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let input, text, img;
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsOf(this.bot.user.id).has("attachFiles") /* 32768 */) return message.channel.createMessage(`<@!${message.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
			img = await this.imageAPIRequest(false,"kiss",true,true);
			if(!img.success) return message.channel.createMessage(`<@!${message.author.id}>, Image API returned an error: ${img.error.description}`);
			message.channel.createMessage(text,{
				file: await this.getImageFromURL(img.response.image),
				name: img.response.name
			});
		} else {
			message.channel.createMessage(text);
		}
	})
};