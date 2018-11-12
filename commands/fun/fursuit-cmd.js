module.exports = (async (self,local) => {
	Object.assign(self,local);
	//if(!self.channel.permissionsFor(self.guild.me).has("ATTACH_FILES")) return self.message.reply("Hey, I require the `ATTACH_FILES` permission for this command to work!");
    var img = await self.imageAPIRequest(true,self.command);
    if(!img.success) return self.message.reply(`Image API returned an error: ${img.error.description}`);
    var attachment = new self.Discord.MessageAttachment(img.response.image);
    self.channel.send(`Fursuit!\nCDN URL: <${img.response.image}>`,attachment);
	
	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});
