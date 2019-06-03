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
		"lsar",
		"listselfassignableroles"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "List self assignable roles",
	usage: "[page]",
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
		let roles, page, c, remove, rl, b, embed, n;
		roles = await mdb.collection("guilds").findOne({id: message.channel.guild.id}).then(res => res.selfAssignableRoles);
		page = message.args.length > 0 ? parseInt(message.args[0],10) : 1;
		if(roles.length === 0) return message.channel.createMessage(`<@!${message.author.id}>, There are no roles set as self assignable.`);
		c = this.chunk(roles,10);
		if(c.length === 0) return message.channel.createMessage(`<@!${message.author.id}>, There are no roles set as self assignable.`);
		if(!page || page > c.length) return message.channel.createMessage(`<@!${message.author.id}>, Invalid page.`);
		remove = [];
		rl = roles.map(a => {
			b = message.channel.guild.roles.get(a);
			if(!b) {
				remove.push(a);
				return `Role Not Found - \`${a}\``;
			}
			return b.name;
		}).join("\n");
		if(remove.length > 0) await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{$pull: {selfAssignableRoles: {$each: remove}}});
		embed = {
			title: "Self Assignable Roles",
			description: `To gain a role, use the command \`${message.gConfig.prefix}iam <role name>\`\nTo go to the next page, use \`${message.gConfig.prefix}\`lsar [page].\nPage ${page}/${c.length}`,
			fields: [
				{
					name: "Roles",
					value: rl,
					inline: false
				}
			]
		};
		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};