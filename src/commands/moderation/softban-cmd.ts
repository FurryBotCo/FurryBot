import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Utility } from "../../util/Functions";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"softban"
	],
	permissions: {
		user: [
			"banMembers"
		],
		bot: [
			"banMembers"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	let deleteDays = 0;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("days")) {
		deleteDays = Number(msg.dashedArgs.parsed.keyValue.days);
		const a = [...msg.args];
		a.splice(a.indexOf(`--days=${msg.dashedArgs.parsed.keyValue.days}`));
		msg.args = a;
		if (deleteDays < 0) return msg.reply("{lang:commands.moderation.softban.deleteLessThan}");
		if (deleteDays > 14) return msg.reply("{lang:commands.moderation.softban.deleteMoreThan}");
	}

	const member = await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(member.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.softban.alreadyBanned}")
				.setDescription(`{lang:commands.moderation.softban.alreadyBannedDesc|${member.username}#${member.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});
	}

	const reason = msg.args.slice(1).join(" ") || Language.get(gConfig.settings.lang, "other.words.noReason", false);
	if (member.id === msg.member.id) return msg.reply("{lang:commands.moderation.softban.noBanSelf}");
	if (member.id === msg.channel.guild.ownerID) return msg.reply("{lang:commands.moderation.softban.noBanOwner}");
	const c = Utility.compareMembers(member, msg.member);
	if ((c.member1.higher || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`{lang:commands.moderation.softban.noBanOther|${member.username}#${member.discriminator}}`);

	// we won't dm on a softban
	// let m: Eris.Message;
	// if (!member.bot && msg.channel.guild.members.has(member.id)) m = await member.user.getDMChannel().then(dm => dm.createMessage(Language.parseString(gConfig.settings.lang, `{lang:commands.moderation.ban.dm|${msg.channel.guild.name}|${reason}}`))).catch(err => null);
	await msg.channel.guild.banMember(member.id, deleteDays, `Softan: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.guild.unbanMember(member.id, `Softan: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***{lang:commands.moderation.softban.userSoftbanned|${member.username}#${member.discriminator}|${reason}}***`).catch(err => null);
			await this.m.create(msg.channel, {
				type: "softban",
				reason,
				target: member,
				blame: msg.author,
				deleteDays
			});
		});
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.ban.englishOnly}`);
		else await msg.channel.createMessage(`{lang:commands.moderation.ban.couldNotBan|${member.username}#${member.discriminator}|${err}}`);
		// if (typeof m !== "undefined") await m.delete();
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) await msg.delete().catch(error => null);
}));
