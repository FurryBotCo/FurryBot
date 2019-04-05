// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"createvoicechannel",
		"cvch"
	],
	userPermissions: [
		"manageChannels" // 16
	],
	botPermissions: [
		"manageChannels" // 16
	],
	cooldown: 1e3,
	description: "Create a voice channel",
	usage: "<name>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		if(message.channel.guild.channels.size >= 500) return message.channel.createMessage(`<@!${message.author.id}>, This server has the maximum channels a server can have, please delete some before creating more.\n(voice, text, category, store, and news channels all count towards this.)`);
		const name = message.args.join(" ");
		if(name.length < 1) return message.channel.createMessage(`<@!${message.author.id}>, that channel name is too short, it must be at least 1 character.`);
		if(name.length > 100) return message.channel.createMessage(`<@!${message.author.id}>, that channel name is too long, it must be 100 characters at max.`);
		await message.channel.guild.createChannel(name,2,`Command: ${message.author.username}#${message.author.discriminator} (${message.author.id})`).then(ch => {
			return message.channel.createMessage(`<@!${message.author.id}>, created new voice channel, **${ch.name}**.`);
		});
	})
};