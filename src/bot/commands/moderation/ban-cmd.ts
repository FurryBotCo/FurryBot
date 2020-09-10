import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Time from "../../../util/Functions/Time";
import parseTime from "parse-duration";
import Eris from "eris";
import Utility from "../../../util/Functions/Utility";

export default new Command(["ban"], __filename)
	.setBotPermissions([
		"embedLinks",
		"banMembers"
	])
	.setUserPermissions([
		"banMembers"
	])
	.setRestrictions([])
	.setCooldown(1e3, true)
	.setExecutor(async function (msg, cmd) {
		const a = [...msg.args], noDM = msg.dashedArgs.value.includes("no-dm");
		let time, deleteDays = 1;
		if (Object.keys(msg.dashedArgs.keyValue).includes("days")) {
			deleteDays = Number(msg.dashedArgs.keyValue.days);
			if (deleteDays < 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteLessThan`));
			if (deleteDays > 14) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteMoreThan`));
		}

		if (msg.args.length >= 2) {
			try {
				time = parseTime(msg.args[1], "ms");
				if (time) a.splice(1, 1);
				else time = 0;
				msg.args = a;
			}
			catch (e) {
				if (e instanceof Error) {// for typings, catch clause cannot be annotated (TS1196)
					if (e.name !== "ERR_INVALID_FORMAT") throw e; // rethrow the error if it's not what we expect

					return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.invalidTime"));
				}
			}
		}

		const user = await msg.getUserFromArgs();
		if (!user) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER").toJSON()
		});

		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.alreadyBanned}`)
				.setDescription(`{lang:${cmd.lang}.alreadyBannedDesc|${user.username}#${user.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});

		const reason = msg.args.slice(1).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (user.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanSelf`));
		if (user.id === msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanOwner`));
		if (msg.channel.guild.members.has(user.id)) {
			const m = msg.channel.guild.members.get(user.id);
			const c = Utility.compareMembers(msg.member, m);
			if ((c.member2.higher || c.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanOther`, [`${user.username}#${user.discriminator}`]));
		}

		let m: Eris.Message;
		if (!noDM && !user.bot && msg.channel.guild.members.has(user.id)) m = await user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, `other.dm.ban${time === 0 ? "Permanent" : ""}`, [msg.channel.guild.name, Time.ms(time, true), reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(err => null);
		await msg.channel.guild.banMember(user.id, deleteDays, `Ban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userBanned${time === 0 ? "" : "Timed"}`, [`${user.username}#${user.discriminator}`, Time.ms(time, true), reason])}***`).catch(err => null);
			await this.m.createBanEntry(msg.channel, msg.gConfig, msg.author, user, time, deleteDays, reason);
			if (time !== 0) await this.t.addEntry("ban", time, Date.now() + time, user.id, msg.channel.guild.id, reason);
		}).catch(async (err) => {
			if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
			else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotBan`, [`${user.username}#${user.discriminator}`, `${err.name}: ${err.message}`]));
			if (typeof m !== "undefined") await m.delete();
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(err => null);
	});
