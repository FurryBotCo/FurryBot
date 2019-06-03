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
		"createrole",
		"cr"
	],
	userPermissions: [
		"manageRoles" // 268435456
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 1e3,
	description: "Create a role",
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
		if(message.channel.guild.roles.size >= 250) return message.channel.createMessage(`<@!${message.author.id}>, This server has the maximum roles a server can have, please delete some before creating more.\n(the roles bots create when they're invited to a server count towards this total)`);
		const name = message.args.join(" ");
		if(name.length < 1) return message.channel.createMessage(`<@!${message.author.id}>, that role name is too short, it must be at least 1 character.`);
		if(name.length > 100) return message.channel.createMessage(`<@!${message.author.id}>, that role name is too long, it must be 100 characters at max.`);
		await message.channel.guild.createRole({ name },`Command: ${message.author.username}#${message.author.discriminator} (${message.author.id})`).then(r => {
			return message.channel.createMessage(`<@!${message.author.id}>, created new role **${r.name}**`);
		});
	})
};