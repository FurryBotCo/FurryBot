module.exports = (async (self,local) => {
	Object.assign(self,local);
	if (self.config.developers.indexOf(self.message.author.id) == -1) {
		return self.message.reply("You cannot run this command as you are not a bot owner.");
	}
	var ty=new RegExp(/^(((command|cmd|c)?[s]?(module|m)?[s]?(list|l)?[s]?)||all)$/gi);
	if(self.args.join("").length == 0) {
		var type="cl";
	} else {
		if(!ty.test(self.args.join(""))) return self.message.reply("Invalid type");
		var type = self.args.join("");
	}
	switch(true) {
		case new RegExp(/^(command|cmd|c)[s]?(list|l)?$/gi).test(type):
			message.reply("Reloading command list..");
			self.reloadCommands();
			break;
			
		case new RegExp(/^((command|cmd|c)(module|m))[s]?$/gi).test(type):
			self.message.reply("Reloading command/custom modules..");
			self.reloadCommandModules();
			break;
			
		case new RegExp(/^(module|m)[s]?$/gi).test(type):
			self.message.reply("Reloading all modules");
			self.reloadModules();
			break;
			
		case type == "all":
			self.message.reply("Reloading everything..");
			self.reloadAll();
			break;
			
		default:
			return self.message.reply("Invalid reload type");
	}
	setTimeout(()=>{
		self.message.reply(`specified reloads finished ${self.config.emojis.furokaypaw}`);
	}, 1e3);
});