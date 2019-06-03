// add: mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: "role"}});
// remove: mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: "role"}})
// get: mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);

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
		let ch = await message.getChannelFromArgs(),
			t = [...message.args];
		if(ch) t.shift();
		else ch = message.channel;
		await message.channel.edit({ topic: t },`Command: ${message.author.username}#${message.author.discriminator}`).then(c => {
			return message.channel.createMessage(`Set the topic of <#${c.id}> to **${c.topic}**`);
		});
	})
};