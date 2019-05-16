// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);

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
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
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