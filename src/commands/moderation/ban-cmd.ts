import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"ban",
		"b"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	let m, deleteDays = 0, time = 0;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("days")) {
		deleteDays = Number(msg.dashedArgs.parsed.keyValue.days);
		const a = [...msg.args];
		a.splice(a.indexOf(`--days=${msg.dashedArgs.parsed.keyValue.days}`));
		msg.args = a;
		if (deleteDays < 0) return msg.reply("{lang:commands.moderation.ban.deleteLessThan}");
		if (deleteDays > 14) return msg.reply("{lang:commands.moderation.ban.deleteMoreThan}");
	}

	if (msg.args.length > 1 && msg.args[1].match(/[0-9]{1,4}[ymdh]/i)) {
		const labels = {
			h: 3.6e+6,
			d: 8.64e+7,
			m: 2.628e+9,
			y: 3.154e+10
		};
		const t = Number(msg.args[1].slice(0, msg.args[1].length - 1).toLowerCase());
		const i = msg.args[1].slice(msg.args[1].length - 1).toLowerCase();
		if (t < 1) return msg.reply("{lang:commands.moderation.ban.timeLessThan}");
		if (!Object.keys(labels).includes(i)) return msg.reply("{lang:commands.moderation.ban.timeInvalid}");
		const a = [...msg.args];
		a.splice(1, 1);
		msg.args = a;
		time = labels[i] * t;
	}

	// get member from message
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(member.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.ban.alreadyBanned}")
				.setDescription(`{lang:commands.moderation.ban.alreadyBannedDesc|${member.username}#${member.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
		});
	}

	if (member.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.moderation.ban.noBanSelf}");
	if (member.id === msg.channel.guild.ownerID) return msg.reply("{lang:commands.moderation.ban.noBanOwner}");
	const a = Utility.compareMembers(member, msg.member);
	if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`{lang:commands.moderation.ban.noBanOther|${member.username}#${member.discriminator}}`);
	// if(!user.bannable) return msg.channel.createMessage(`<@!${msg.author.id}>, I cannot ban ${member.username}#${member.discriminator}! Do they have a higher role than me? Do I have ban permissions?`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang).get("other.noReason").toString();
	if (!member.user.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(`{lang:commands.moderation.ban.banDm|${msg.channel.guild.name}|${reason}}`)).catch(err => null);
	member.ban(deleteDays, `Ban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.ban.userBanned|${member.username}#${member.discriminator}|${reason}}***`).catch(err => null);
		await this.m.create(msg.channel, {
			type: "ban",
			time,
			reason,
			target: member,
			blame: msg.author,
			deleteDays
		});
		if (time !== 0) await mdb.collection<GlobalTypes.TimedEntry>("timed").insertOne({
			time,
			expiry: Date.now() + time,
			userId: member.id,
			guildId: msg.channel.guild.id,
			type: "ban",
			reason
		} as any); // apparently mongodb's types require specifying "_id" so we'll do this now
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.ban.englishOnly}`);
		else await msg.channel.createMessage(`{lang:commands.moderation.ban.couldNotBan|${member.username}#${member.discriminator}|${err}}`);
		if (typeof m !== "undefined") await m.delete();
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
