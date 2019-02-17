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
	run: (async(message) => {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let input, text, attachment, img;
		input = message.args.join(" ");
		text = message.client.varParse(message.c,{author:message.author,input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
			img = await message.client.imageAPIRequest(false,"cuddle",true,true);
			if(!img.success) return message.reply(`Image API returned an error: ${img.error.description}`);
			attachment = new message.client.Discord.MessageAttachment(img.response.image);
			message.channel.send(text,attachment);
		} else {
			message.channel.send(text);
		}
	})
};