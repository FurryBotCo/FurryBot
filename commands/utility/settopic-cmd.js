// add: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: this.mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);

module.exports = {
	triggers: [
		"settopic",
		"st"
	],
	userPermissions: [
		"manageChannels" // 16
	],
	botPermissions: [
		"manageChannels" // 16
	],
	cooldown: 1e3,
	description: "Set a channels topic",
	usage: "[channel] <topic>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let ch = await message.getChannelFromArgs(),
			t = [...message.args];
		if(ch) t.shift();
		else ch = message.channel;
		await message.channel.edit({ topic: t },`Command: ${message.author.username}#${message.author.discriminator}`).then(c => {
			return message.channel.createMessage(`Set the topic of <#${c.id}> to **${c.topic}**`);
		});
	})
};