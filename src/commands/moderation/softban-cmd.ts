import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, EmbedBuilder, CommandError } from "core";
import Language from "language";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["softban"], __filename)
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
		const [, ...r] = msg.args;
		const noDM = msg.dashedArgs.value.includes("no-dm");
		let deleteDays = 1;

		if (!isNaN(Number(r[r.length - 1]))) {
			deleteDays = Number(r[r.length - 1]);
			r.splice(-1);
		}
		if (deleteDays < 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteLessThan`));
		if (deleteDays > 7) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteMoreThan`));

		const member = await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(member.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.alreadyBanned}`)
				.setDescription(`{lang:${cmd.lang}.alreadyBannedDesc|${member.tag}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});

		const reason = (r ?? []).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (member.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSoftBanSelf`));
		if (member.id === msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSoftBanOwner`));

		const mb = msg.channel.guild.members.get(member.id);
		if (mb) {
			const c = BotFunctions.compareMembers(msg.member, mb);
			if ((c.member2.higher || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSoftBanOther`, [member.tag]));
			const d = BotFunctions.compareMembers(mb, msg.channel.guild.me);
			if ((d.member1.higher || d.member1.same)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.meNoSoftBan`, [mb.tag]));
		}

		let m: Eris.Message | null = null;
		if (!noDM && !member.user.bot && msg.channel.guild.members.has(member.id)) m = await member.user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, "other.dm.softBan", [msg.channel.guild.name, reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(() => null);
		await msg.channel.guild.banMember(member.id, deleteDays, `SoftBan: ${msg.author.tag} (${msg.author.id}) -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userSoftBanned`, [member.tag, reason])}***`).catch(() => null);
			await this.executeModCommand("softban", {
				target: member.id,
				deleteDays,
				reason,
				channel: msg.channel.id,
				blame: msg.author.id
			});
			await msg.channel.guild.unbanMember(member.id, `SoftBan: ${msg.author.tag} (${msg.author.id}) -> ${reason}`);
		}).catch(async (err) => {
			if (err instanceof Error) {
				if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
				else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotSoftBan`, [`${member.tag}`, `${err.name}: ${err.message}`]));
				if (m !== null) await m.delete();
			}
		});
		if (msg.channel.permissionsOf(this.client.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
