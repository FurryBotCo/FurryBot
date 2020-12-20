import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Eris from "eris";
import Utility from "../../util/Functions/Utility";
import CommandError from "../../util/cmd/CommandError";

export default new Command(["kick"], __filename)
	.setBotPermissions([
		"embedLinks",
		"kickMembers"
	])
	.setUserPermissions([
		"kickMembers"
	])
	.setRestrictions([])
	.setCooldown(1e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER").toJSON()
		});

		const reason = msg.args.slice(1).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (member.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noKickSelf`));
		if (member.id === msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noKickOwner`));
		const c = Utility.compareMembers(msg.member, member);
		if ((c.member1.lower || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noKickOther`, [`${member.user.username}#${member.user.discriminator}`]));
		const d = Utility.compareMembers(member, msg.channel.guild.me);
		if ((d.member1.higher || d.member1.same)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.meNoKick`, [`${member.user.username}#${member.user.discriminator}`]));

		let m: Eris.Message;
		if (!member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(Language.parseString(msg.gConfig.settings.lang, `{lang:other.dm.kick|${msg.channel.guild.name}|${reason}}\n\n{lang:other.dm.notice}`))).catch(err => null);
		await msg.channel.guild.kickMember(member.id, encodeURIComponent(`Kick: ${msg.author.tag} (${msg.author.id}) -> ${reason}`)).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userKicked`, [`${member.user.username}#${member.user.discriminator}`, reason])}***`).catch(err => null);
			await this.m.createKickEntry(msg.channel, msg.gConfig, msg.author, member, reason);
		}).catch(async (err) => {
			if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
			else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotKick`, [`${member.user.username}#${member.user.discriminator}`, `${err.name}: ${err.message}`]));
			if (typeof m !== "undefined") await m.delete();
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(err => null);
	});
