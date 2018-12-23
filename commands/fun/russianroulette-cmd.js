module.exports = {
	triggers: [
		"russionroulette",
		"rr"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Play russian roulette",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (self,local) => {
	
		var val = Math.floor(Math.random()*6);
		var bullets = typeof local.args[0] !== "undefined" ? parseInt(local.args[0],10) : 3;
		
		if(val<=bullets-1) {
			return local.message.reply("You died!");
		} else {
			return local.message.reply("You lived!");
		}
	})
};