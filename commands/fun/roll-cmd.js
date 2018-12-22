mmodule.exports = {
	triggers: ["roll"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Roll the dice",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

odule.exports = (async (self,local) => {
	
	var min = typeof local.args[0] !== "undefined" ? parseInt(local.args[0],10) : 1;
	var max = typeof local.args[1] !== "undefined" ? parseInt(local.args[1],10) : 20;

	return local.message.reply(`you rolled a ${self._.random(min,max)}!`);
});