module.exports = (async (self,local) => {
	Object.assign(self,local);
	if(!self.args[0]) {
		return new Error("ERR_INVALID_USAGE");
	}
	
	var input = self.args.join(" ");
	var text = self.varParse(self.c,{author:self.author,input:input});
	if(self.gConfig.commandImages) {
		if(!self.channel.permissionsFor(self.guild.me).has("ATTACH_FILES")) return self.message.reply("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
		var img = await self.imageAPIRequest(true,self.command);
		if(!img.success) return self.message.reply(`Image API returned an error: ${img.error.description}`);
		var attachment = new self.Discord.MessageAttachment(img.response.image);
		self.channel.send(text,attachment);
	} else {
		self.channel.send(text);
	}
	
	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});
