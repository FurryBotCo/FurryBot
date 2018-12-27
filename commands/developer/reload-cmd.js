module.exports = {
	triggers: [
		"reload"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Reload parts of the bot",
	usage: "[command/module/commandmodule/all]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
		message.channel.startTyping();
		if (client.config.developers.indexOf(message.author.id) === -1) {
			return message.reply("You cannot run this command as you are not a bot owner.");
		}
		var ty=new RegExp(/^(((command|cmd|c)?[s]?(module|m)?[s]?(list|l)?[s]?)||all)$/gi);
		if(message.rgs.join("").length === 0) {
			var type="cl";
		} else {
			if(!ty.test(message.unparsedArgs.join(""))) return message.reply("Invalid type");
			var type = message.unparsedArgs.join("");
		}
		switch(true) {
			case new RegExp(/^(command|cmd|c)[s]?(list|l)?$/gi).test(type):
				message.reply("Reloading command list..");
				client.reloadCommands();
				break;
				
			case new RegExp(/^((command|cmd|c)(module|m))[s]?$/gi).test(type):
				message.reply("Reloading command/custom modules..");
				client.reloadCommandModules();
				break;
				
			case new RegExp(/^(module|m)[s]?$/gi).test(type):
				message.reply("Reloading all modules");
				client.reloadModules();
				break;
				
			case "all":
				message.reply("Reloading everything..");
				client.reloadAll();
				break;
				
			default:
				return message.reply("Invalid reload type");
		}
		setTimeout((msg) => {
			msg.reply(`specified reloads finished ${client.config.emojis.furokaypaw}`);
			msg.channel.stopTyping();
		}, 1e3,message);
	})
};