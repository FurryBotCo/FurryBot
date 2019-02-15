module.exports = {
	triggers: [
		"roll"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Roll the dice",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
	
		var min = typeof message.args[0] !== "undefined" ? parseInt(message.args[0],10) : 1;
		var max = typeof message.args[1] !== "undefined" ? parseInt(message.args[1],10) : 20;
	
		return message.reply(`you rolled a ${this._.random(min,max)}!`);
	})
};