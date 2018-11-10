module.exports = (async (self,local) => {
	Object.assign(self,local);
	if(!self.args[0]) {
		return new Error("ERR_INVALID_USAGE");
	}
	
	var input = self.args.join(" ");
	var text = self.varParse(self.c,{author:self.author,input:input});
	if(self.gConfig.imageCommands) {
		if(!self.channel.permissionsFor(self.guild.me).has("ATTACH_FILES")) return self.message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
		var attachment = new self.Discord.MessageAttachment("https://assets.furrybot.me/bap.gif");
		self.channel.send(text,attachment);
	} else {
		self.channel.send(text);
	}
	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});