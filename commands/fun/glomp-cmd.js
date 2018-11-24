module.exports = (async (self,local) => {
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
	var text = self.varParse(local.c,{author:local.author,input:local.args.join(" ")});
	local.channel.send(text);

	if(!local.gConfig.deleteCommands) {
		local.message.delete().catch(noerr => {});
	}
});