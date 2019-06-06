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
		"ban",
		"b"
	],
	userPermissions: [
		"banMembers" // 4
	],
	botPermissions: [
		"banMembers" // 4
	],
	cooldown: 1e3,
	description: "Ban members from your server",
	usage: "<@member/id>",
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function (message) {
		const sub = await functions.processSub(module.exports, message, this);
		if (sub !== "NOSUB") return sub;
		if (message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, data, embed, reason, m;
		// get member from message
		user = await message.getMemberFromArgs();

		if (!user) return message.errorEmbed("INVALID_USER");

		if (message.channel.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			if ((await message.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
				data = {
					title: "User already banned",
					description: `It looks like ${user.username}#${user.discriminator} is already banned here..`
				};
				Object.assign(data, message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				return message.channel.createMessage(embed);
			}
		}

		if (user.id === message.member.id && !message.user.isDeveloper) return message.channel.createMessage(`<@!${message.author.id}>, Pretty sure you don't want to do this to yourself.`);
		if (user.id === message.guild.ownerID) return message.channel.createMessage(`<@!${message.author.id}>, You cannot ban the server owner.`);
		let a = this.compareMembers(user, message.member);
		if ((a.member1.higher || a.member1.same) && message.author.id !== message.channel.guild.ownerID) return message.channel.createMessage(`<@!${message.author.id}>, You cannot ban ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
		//if(!user.bannable) return message.channel.createMessage(`<@!${message.author.id}>, I cannot ban ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have ban permissions?`);
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
		if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were banned from **${message.channel.guild.name}**\nReason: ${reason}`));
		user.ban(1, user.id, `Ban: ${message.author.username}#${user.discriminator} -> ${reason}`).then(() => {
			message.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
		}).catch(async (err) => {
			message.channel.createMessage(`I couldn't ban **${user.username}#${user.discriminator}**, ${err}`);
			if (m !== undefined) {
				await m.delete();
			}
		});
		if (!message.gConfig.deleteCommands && message.channel.permissionsOf(this.bot.user.id).has("manageMessages")) message.delete().catch(error => null);
	})
};