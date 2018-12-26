module.exports = {
	triggers: [
		"boop",
		"snoot"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Boop someones snoot!",
	usage: "<@member/text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		var input = message.args.join(" ");
		var text = client.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
			var img = await client.imageAPIRequest(true,client.command);
			if(!img.success) return message.reply(`Image API returned an error: ${img.error.description}`);
			var attachment = new client.Discord.MessageAttachment(img.response.image);
			message.channel.send(text,attachment);
		} else {
			message.channel.send(text);
		}
		
		if(!message.gConfig.deleteCommands) {
			message.delete().catch(noerr => {});
		}
	})
};
