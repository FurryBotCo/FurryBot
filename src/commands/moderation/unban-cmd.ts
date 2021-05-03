import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, EmbedBuilder, CommandError } from "core";
import Language from "language";


export default new Command<FurryBot, UserConfig, GuildConfig>(["unban", "ub"], __filename)
	.setBotPermissions([
		"embedLinks",
		"banMembers"
	])
	.setUserPermissions([
		"banMembers"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const user = await msg.getUserFromArgs();
		if (!user) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});

		if (!(await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id)))) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.notBanned}`)
				.setDescription(`{lang:${cmd.lang}.notBannedDesc|${user.tag}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});

		const reason = (msg.args.slice(1) ?? []).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");

		await msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.tag} (${msg.author.id}) -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unbanned`, [user.tag, reason])}***`).catch(() => null);
			await this.executeModCommand("unban", {
				target: user.id,
				reason,
				channel: msg.channel.id,
				blame: msg.author.id
			});
		}).catch(async (err) => {
			if (err instanceof Error) {
				if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
				else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotUnban`, [`${user.tag}`, `${err.name}: ${err.message}`]));
			}
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
