import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Eris from "eris";
import Utility from "../../util/Functions/Utility";

export default new Command(["softban"], __filename)
	.setBotPermissions([
		"embedLinks",
		"banMembers"
	])
	.setUserPermissions([
		"banMembers"
	])
	.setRestrictions([])
	.setCooldown(1e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		let deleteDays = 7;
		if (Object.keys(msg.dashedArgs.keyValue).includes("days")) {
			deleteDays = Number(msg.dashedArgs.keyValue.days);
			if (deleteDays < 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteLessThan`));
			if (deleteDays > 14) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteMoreThan`));
		}

		const member = await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER").toJSON()
		});

		const reason = msg.args.slice(1).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (member.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSoftBanSelf`));
		if (member.id === msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSoftBanOwner`));
		if (msg.channel.guild.members.has(member.id)) {
			const m = msg.channel.guild.members.get(member.id);
			const c = Utility.compareMembers(msg.member, m);
			if ((c.member1.higher || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanOther`, [`${member.username}#${member.discriminator}`]));
			const d = Utility.compareMembers(member, msg.channel.guild.me);
			if ((d.member1.higher || d.member1.same)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.meNoSoftBan`, [`${member.user.username}#${member.user.discriminator}`]));

		}

		let m: Eris.Message;
		if (!member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, "other.dm.softBan", [msg.channel.guild.name, reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(err => null);
		await msg.channel.guild.banMember(member.id, deleteDays, encodeURIComponent(`Softban: ${msg.author.tag} (${msg.author.id}) -> ${reason}`)).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userSoftBanned`, [`${member.username}#${member.discriminator}`, reason])}***`).catch(err => null);
			await this.m.createSoftBanEntry(msg.channel, msg.gConfig, msg.author, member, deleteDays, reason);
			await msg.channel.guild.unbanMember(member.id, encodeURIComponent(`Softban: ${msg.author.tag} (${msg.author.id}) ->  ${reason}`));
		}).catch(async (err) => {
			if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
			else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotSoftBan`, [`${member.username}#${member.discriminator}`, `${err.name}: ${err.message}`]));
			if (typeof m !== "undefined") await m.delete();
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(err => null);
	});
