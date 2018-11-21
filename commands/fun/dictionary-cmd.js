module.exports = (async (self,local) => {
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
	
	var input = local.args.join(" ");
	var text = self.varParse(local.c,{author:local.author,input:input});
	local.channel.send(text);
	
	if(!local.gConfig.deleteCmds) {
		local.message.delete().catch(noerr => {});
	}
});
