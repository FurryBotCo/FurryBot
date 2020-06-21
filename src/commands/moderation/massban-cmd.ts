import Command from "../../modules/CommandHandler/Command";
import Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time, Utility } from "../../util/Functions";
import Language from "../../util/Language";
import { mdb } from "../../modules/Database";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"massban",
		"mrb"
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
	if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);
	let deleteDays = 0, time = 0;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("days")) {
		deleteDays = Number(msg.dashedArgs.parsed.keyValue.days);
		const a = [...msg.args];
		a.splice(a.indexOf(`--days=${msg.dashedArgs.parsed.keyValue.days}`));
		msg.args = a;
		if (deleteDays < 0) return msg.reply("{lang:commands.moderation.ban.deleteLessThan}");
		if (deleteDays > 14) return msg.reply("{lang:commands.moderation.ban.deleteMoreThan}");
	}

	if (msg.args.length >= 2) {
		try {
			time = Time.modParsing(msg.args[1]);
			if (!!time) {
				const a = [...msg.args];
				a.splice(1, 1);
				msg.args = a;
			}
		}
		catch (e) {
			if (e instanceof Error) {// for typings, catch clause cannot be annotated (TS1196)
				if (e.name !== "ERR_INVALID_FORMAT") throw e; // rethrow the error if it's not what we expect

				return msg.reply("{lang:other.errors.invalidTime}");
			}
		}
	}

	let user: Eris.User | Eris.Member = await msg.getMemberFromArgs();
	if (!user) user = await msg.getUserFromArgs();
	if (!user) return msg.errorEmbed("INVALID_USER");
	if (user instanceof Eris.Member) user = user.user;

	if (msg.channel.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.ban.alreadyBanned}")
				.setDescription(`{lang:commands.moderation.ban.alreadyBannedDesc|${user.username}#${user.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});
	}

	const reason = msg.args.slice(1).join(" ") || Language.get(gConfig.settings.lang, "other.words.noReason", false);
	if (user.id === msg.member.id) return msg.reply("{lang:commands.moderation.ban.noBanSelf}");
	if (user.id === msg.channel.guild.ownerID) return msg.reply("{lang:commands.moderation.ban.noBanOwner}");
	if (msg.channel.guild.members.has(user.id)) {
		const m = msg.channel.guild.members.get(user.id);
		const c = Utility.compareMembers(m, msg.member);
		if ((c.member1.higher || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`{lang:commands.moderation.ban.noBanOther|${user.username}#${user.discriminator}}`);
	}

	let m: Eris.Message;
	if (!user.bot && msg.channel.guild.members.has(user.id)) m = await user.getDMChannel().then(dm => dm.createMessage(Language.parseString(gConfig.settings.lang, `{lang:commands.moderation.ban.dm|${msg.channel.guild.name}|${reason}}`))).catch(err => null);
	await msg.channel.guild.banMember(user.id, deleteDays, `Ban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.ban.userBanned|${user.username}#${user.discriminator}|${reason}}***`).catch(err => null);
		await this.m.create(msg.channel, {
			type: "ban",
			time,
			reason,
			target: user,
			blame: msg.author,
			deleteDays
		});
		if (time !== 0) await mdb.collection<GlobalTypes.TimedEntry>("timed").insertOne({
			time,
			expiry: Date.now() + time,
			userId: user.id,
			guildId: msg.channel.guild.id,
			type: "ban",
			reason
		} as any);
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.ban.englishOnly}`);
		else await msg.channel.createMessage(`{lang:commands.moderation.ban.couldNotBan|${user.username}#${user.discriminator}|${err}}`);
		if (typeof m !== "undefined") await m.delete();
	});
	if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) await msg.delete().catch(error => null);
}));
