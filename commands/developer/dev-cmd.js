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
		const s = this.walkDirSync(`${__dirname}/dev`,true);
		console.log(s);
	})
};