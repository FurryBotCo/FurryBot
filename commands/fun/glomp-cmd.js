module.exports = (async (self,local) => {
	Object.assign(self,local);
	if(!self.args[0]) {
		return new Error("ERR_INVALID_USAGE");
	}
	var text = self.varParse(self.c,{author:self.author,input:self.args.join(" ")});
	self.channel.send(text);

	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});