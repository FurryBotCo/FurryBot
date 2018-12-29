module.exports = {
	triggers: [
		"russianroulette",
		"roulette"
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
	run: (async (client,message) => {
	
		var val = Math.floor(Math.random()*6);
		var bullets = typeof message.args[0] !== "undefined" ? parseInt(message.args[0],10) : 3;
		
		if(val<=bullets-1) {
			return message.reply("You died!");
		} else {
			return message.reply("You lived!");
		}
	})
};