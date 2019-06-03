const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"add",
		"+"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "",
	usage: "",
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

		if(!message.guild.members.get(this.bot.user.id).permission.has("manageRoles")) return message.reply("I don't have the **manageRoles** permission, please give me this permission to use this command.");

		const mr = message.member.roles.map(r => message.guild.roles.get(r)),
			br = message.guild.members.get(this.bot.user.id).roles.map(r => message.guild.roles.get(r)),
			mtr = mr.filter(r => r.position === Math.max.apply(Math, mr.map(r => r.position))),
			btr = mr.filter(r => r.position === Math.max.apply(Math, br.map(r => r.position)));

		return;
		
		/* eslint-disable no-unreachable */
		const role = await message.getRoleFromArgs();
		if(!role) return message.errorEmbed("INVALID_ROLE");

		const member = await message.getMemberFromArgs();
		if(!member) return message.errorEmbed("INVALID_MEMBER");

		if(member.roles.includes(role.id)) return message.reply(`**${member.user.username}#${member.user.discriminator}** already has the role **${role.name}**.`);

		member.addRole(role.id,`Command: ${message.author.username}#${message.author.discriminator}`)
			.then(() => message.reply(`added **${role.name}** to **${member.user.username}#${member.user.discriminator}**.`))
			.catch(err => message.reply(`failed to add **${role.name}** to **${member.user.username}#${member.user.discriminator}**, check my permissions, and roles.`));

		/* eslint-enable no-unreachable */
	})
};