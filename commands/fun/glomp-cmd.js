module.exports=(async (self) => {
	if(!self.args[0]) {
		return new Error("INVALID_USAGE");
	}
	var text = self.varParse(self.c,{author:self.author,input:self.args.join(" ")});
	self.channel.send(text);

	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});