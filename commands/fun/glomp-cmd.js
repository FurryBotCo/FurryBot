module.exports = {
	triggers: ["glomp"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Pounce onto someone lovingly~!",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async (self,local) => {
	if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
	var text = self.varParse(local.c,{author:local.author,input:local.args.join(" ")});
	local.channel.send(text);

	if(!local.gConfig.deleteCommands) {
		local.message.delete().catch(noerr => {});
	}
});