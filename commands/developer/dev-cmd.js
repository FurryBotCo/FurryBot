module.exports = {
	triggers: [
		"dev",
		"d"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Developer Commands",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		else return this.sendCommandEmbed(message,message.command);
	})
};