const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"createtextchannel",
		"ctch"
	],
	userPermissions: [
		"manageChannels" // 16
	],
	botPermissions: [
		"manageChannels" // 16
	],
	cooldown: 1e3,
	description: "Create a text channel",
	usage: "<name>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		if(message.channel.guild.channels.size >= 500) return message.channel.createMessage(`<@!${message.author.id}>, This server has the maximum channels a server can have, please delete some before creating more.\n(voice, text, category, store, and news channels all count towards this.)`);
		const name = message.args.join("\u2009\u2009");
		if(name.length < 1) return message.channel.createMessage(`<@!${message.author.id}>, that channel name is too short, it must be at least 1 character.`);
		if(name.length > 100) return message.channel.createMessage(`<@!${message.author.id}>, that channel name is too long, it must be 100 characters at max.`);
		await message.channel.guild.createChannel(name,0,`Command: ${message.author.username}#${message.author.discriminator} (${message.author.id})`).then(ch => {
			return message.channel.createMessage(`<@!${message.author.id}>, created new text channel, <#${ch.id}>`);
		});
	})
};