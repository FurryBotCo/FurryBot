import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import Time from "../../../util/Functions/Time";
import parseTime from "parse-duration";
import Eris from "eris";
import Utility from "../../../util/Functions/Utility";
import CommandError from "../../../util/cmd/CommandError";

export default new Command(["unban"], __filename)
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
		if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);

		const user = await msg.getUserFromArgs();

		if (!user) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER").toJSON()
		});

		if (!(await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.notBanned}`)
				.setDescription(`{lang:${cmd.lang}.notBannedDesc|${user.username}#${user.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.red)
				.toJSON()
		});

		const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		await msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unbanned`, [`${user.username}#${user.discriminator}`, reason])}***`).catch(noerr => null);
			await this.m.createUnbanEntry(msg.channel, msg.gConfig, msg.author, user, reason);
		}).catch(async (err) => {
			if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
			else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotUnban`, [`${user.username}#${user.discriminator}`, err]));
		});

		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(error => null);
	});
