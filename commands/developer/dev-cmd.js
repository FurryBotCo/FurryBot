module.exports = {
	triggers: [
		"d",
		"dev"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Developer Commands",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const args = [...message.args],
			cmd = args.shift().toLowerCase(),
			sub = require("./subcommands").map(c => c.commands).reduce((a,b) => a.concat(b)).filter(cc => cc.triggers.includes(cmd));
		
		
	})
}