import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, EmbedBuilder, CommandError } from "core";
import Language from "language";
import { Time } from "utilities";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["ban", "b"], __filename)
	.setBotPermissions([
		"embedLinks",
		"banMembers"
	])
	.setUserPermissions([
		"banMembers"
	])
	.setRestrictions([])
	.setCooldown(1e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const [args, t] = msg.args.join(" ").split("|").map(v => v.trim());
		const [, ...r] = args.split(" ");
		const noDM = msg.dashedArgs.value.includes("no-dm");
		let time = 0, deleteDays = 1;

		if (!isNaN(Number(r[r.length - 1]))) {
			deleteDays = Number(r[r.length - 1]);
			r.splice(-1);
		}
		if (deleteDays < 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteLessThan`));
		if (deleteDays > 7) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteMoreThan`));

		if (t) time = Time.parseTime2(t);
		// 5 years max
		if (time === undefined || time < 0 || time > 1.577e+11) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.invalidTime"));

		const user = await msg.getUserFromArgs();
		if (!user) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});

		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.alreadyBanned}`)
				.setDescription(`{lang:${cmd.lang}.alreadyBannedDesc|${user.tag}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});

		const reason = (r ?? []).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (user.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanSelf`));
		if (user.id === msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanOwner`));

		const mb = msg.channel.guild.members.get(user.id);
		if (mb) {
			const c = BotFunctions.compareMembers(msg.member, mb);
			if ((c.member2.higher || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanOther`, [user.tag]));
			const d = BotFunctions.compareMembers(mb, msg.channel.guild.me);
			if ((d.member1.higher || d.member1.same)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.meNoBan`, [mb.tag]));
		}

		let m: Eris.Message | null = null;
		if (!noDM && !user.bot && msg.channel.guild.members.has(user.id)) m = await user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, `other.dm.ban${!time ? "Permanent" : ""}`, [msg.channel.guild.name, Time.ms(time, true), reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(() => null);
		await msg.channel.guild.banMember(user.id, deleteDays, `Ban: ${msg.author.tag} (${msg.author.id}) -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userBanned${!time ? "" : "Timed"}`, [user.tag, Time.ms(time, true), reason])}***`).catch(() => null);
			await this.executeModCommand("ban", {
				target: user.id,
				deleteDays,
				expiry: time,
				reason,
				channel: msg.channel.id,
				blame: msg.author.id
			});
			if (time) await this.executeModCommand("timedAction", {
				subType: "ban",
				time,
				expiry: Date.now() + time,
				user: user.id,
				guild: msg.channel.guild.id,
				reason
			});
		}).catch(async (err) => {
			if (err instanceof Error) {
				if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
				else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotBan`, [`${user.tag}`, `${err.name}: ${err.message}`]));
				if (m !== null) await m.delete();
			}
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
