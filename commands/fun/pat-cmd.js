module.exports = {
	triggers: ["pat"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Pat someone uwu",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async (self,local) => {
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");

	var input = local.args.join(" ");
	var text = self.varParse(local.c,{author:local.author,input:input});
	local.channel.send(text);
	
	if(!local.gConfig.deleteCommands) {
		local.message.delete().catch(noerr => {});
	}
});
