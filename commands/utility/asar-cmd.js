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
		"asar",
		"addselfassignablerole"
	],
	userPermissions: [
		"manageRoles" // 268435456
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 1e3,
	description: "Add a self assignable role",
	usage: "<@role/role id/role name>",
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
		let role, roles, a, b;
		role = await message.getRoleFromArgs();
		if(!role) return message.errorEmbed("INVALID_ROLE");
		a = this.compareMemberWithRole(message.member,role);
		b = this.compareMemberWithRole(message.guild.members.get(this.bot.user.id),role);
		if((a.higher || a.same) && message.channel.guild.ownerID !== message.member.id) return message.channel.createMessage(`<@!${message.author.id}>, You cannot add roles as high as, or higher than you.`);
		if(b.higher || b.same) return message.channel.createMessage(`<@!${message.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
		if(role.managed) return message.channel.createMessage(`<@!${message.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
		roles = await mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);
		if(roles.includes(role.id)) return message.channel.createMessage(`<@!${message.author.id}>, this role is already listed as a self assignable role.`);
		await  mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id}, {$push: {selfAssignableRoles: role.id}});
		return message.channel.createMessage(`<@!${message.author.id}>, Added **${role.name}** to the list of self assignable roles.`);
	})
};