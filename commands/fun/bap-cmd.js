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
	run: (async (client,message) => {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		var input = message.args.join(" ");
		var text = client.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.imageCommands) {
			if(!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
			var attachment = new client.Discord.MessageAttachment("https://furrybot.furcdn.net/bap.gif");
			message.channel.send(text,attachment);
		} else {
			message.channel.send(text);
		}
		if(!message.gConfig.deleteCommands) {
			message.delete().catch(noerr => {});
		}
		return message.channel.stopTyping();
	})
};