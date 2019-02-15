module.exports = {
	triggers: [
		"cuddle",
		"snuggle",
		"snug"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Cuddle someone",
	usage: "<@member/text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		var input = message.args.join(" ");
		var text = this.varParse(message.c,{author:message.author,input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
			var img = await this.imageAPIRequest(true,"cuddle");
			if(!img.success) return message.reply(`Image API returned an error: ${img.error.description}`);
			var attachment = new this.Discord.MessageAttachment(img.response.image);
			message.channel.send(text,attachment);
		} else {
			message.channel.send(text);
		}
	})
};