module.exports = (async (self,local) => {
	local.channel.startTyping();
	if (self.config.developers.indexOf(local.message.author.id) === -1) {
		return local.message.reply("You cannot run this command as you are not a bot owner.");
	}
	var ty=new RegExp(/^(((command|cmd|c)?[s]?(module|m)?[s]?(list|l)?[s]?)||all)$/gi);
	if(local.args.join("").length === 0) {
		var type="cl";
	} else {
		if(!ty.test(local.args.join(""))) return local.message.reply("Invalid type");
		var type = local.args.join("");
	}
	switch(true) {
		case new RegExp(/^(command|cmd|c)[s]?(list|l)?$/gi).test(type):
			local.message.reply("Reloading command list..");
			self.reloadCommands();
			break;
			
		case new RegExp(/^((command|cmd|c)(module|m))[s]?$/gi).test(type):
			local.message.reply("Reloading command/custom modules..");
			self.reloadCommandModules();
			break;
			
		case new RegExp(/^(module|m)[s]?$/gi).test(type):
			local.message.reply("Reloading all modules");
			self.reloadModules();
			break;
			
		case "all":
			local.message.reply("Reloading everything..");
			self.reloadAll();
			break;
			
		default:
			return local.message.reply("Invalid reload type");
	}
	setTimeout((msg) => {
		msg.reply(`specified reloads finished ${self.config.emojis.furokaypaw}`);
		msg.channel.stopTyping();
	}, 1e3,local.message);
});