import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, CommandError } from "core";
import Language from "language";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["kick", "k"], __filename)
	.setBotPermissions([
		"embedLinks",
		"kickMembers"
	])
	.setUserPermissions([
		"kickMembers"
	])
	.setRestrictions([])
	.setCooldown(1e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER").toJSON()
		});

		const reason = msg.args.slice(1).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (member.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noKickSelf`));
		if (member.id === msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noKickOwner`));
		const c = BotFunctions.compareMembers(msg.member, member);
		if ((c.member1.lower || c.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noKickOther`, [`${member.user.username}#${member.user.discriminator}`]));
		const d = BotFunctions.compareMembers(member, msg.channel.guild.me);
		if ((d.member1.higher || d.member1.same)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.meNoKick`, [`${member.user.username}#${member.user.discriminator}`]));

		let m: Eris.Message | null = null;
		if (!member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(Language.parseString(msg.gConfig.settings.lang, `{lang:other.dm.kick|${msg.channel.guild.name}|${reason}}\n\n{lang:other.dm.notice}`))).catch(() => null);
		await msg.channel.guild.kickMember(member.id, encodeURIComponent(`Kick: ${msg.author.tag} (${msg.author.id}) -> ${reason}`)).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userKicked`, [`${member.user.username}#${member.user.discriminator}`, reason])}***`).catch(() => null);
			await this.executeModCommand("kick", {
				blame: msg.author.id,
				channel: msg.channel.id,
				target: member.id,
				reason
			});
		}).catch(async (err) => {
			if (err instanceof Error) {
				if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
				else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotKick`, [`${member.user.username}#${member.user.discriminator}`, `${err.name}: ${err.message}`]));
				if (m !== null) await m.delete();
			}
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
