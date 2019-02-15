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
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		var input = message.args.join(" ");
		var text = this.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
			var attachment = new this.Discord.MessageAttachment("https://i.fb.furcdn.net/bap.gif");
			message.channel.send(text,attachment);
		} else {
			message.channel.send(text);
		}
		return message.channel.stopTyping();
	})
};