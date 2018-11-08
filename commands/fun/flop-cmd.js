module.exports=(async (self) => {
	if(!self.args[0]) {
		return new Error("INVALID_USAGE");
	}
	
	var input = self.args.join(" ");
	var text = self.varParse(self.c,{author:self.author,input:input});
	self.channel.send(text);
	
	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});
