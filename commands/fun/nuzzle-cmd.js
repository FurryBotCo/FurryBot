module.exports = (async (self,local) => {
	Object.assign(self,local);
	if(!self.args[0]) {
		return new Error("ERR_INVALID_USAGE");
	}

	var input = self.args.join(" ");
	var text = self.varParse(self.c,{author:self.author,input:input});
	self.channel.send(text);
	
	if(!self.gConfig.deleteCmds) {
		self.message.delete().catch(noerr => {});
	}
});
