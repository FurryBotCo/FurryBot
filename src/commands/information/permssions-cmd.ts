import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["permissions", "perms"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const remove = ["all", "allGuild", "allText", "allVoice"];
		const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});
		const v = {
			plus: [] as Array<string>,
			minus: [] as Array<string>
		};
		const chp = msg.channel.permissionsOf(member.id);
		const type = msg.dashedArgs.value.includes("channel") ? "Channel" : "Server";
		const compact = msg.dashedArgs.value.includes("compact");
		const l = Object.keys(Eris.Constants.Permissions);
		// remove old (duplicate) deprecated permission names
		["viewAuditLogs", "stream", "viewChannel", "readMessageHistory", "externalEmojis"].forEach(p => l.splice(l.indexOf(p), 1));
		l.filter(p => !remove.includes(p)).map(p => {
			const h = (type === "Server" ? member.permissions : chp).has(p);
			return (h ? v.plus : v.minus).push(`${h ? "+" : "-"} ${compact ? p : `{lang:other.permissions.${p}}`}`);
		});

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title${type}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.green)
				.setDescription([
					`{lang:${cmd.lang}.${member.id === msg.member.id ? `self${type}` : `other${type}|${member.user.username}#${member.user.discriminator}`}}`,
					"```diff",
					...v.plus,
					...v.minus,
					"```",
					...(!compact ? [
						"",
						`{lang:${cmd.lang}.compact|${msg.prefix}|${member.username}#${member.discriminator}|${type === "Channel" ? " --channel" : ""}}`
					] : []),
					...(type === "Server" ? [
						"",
						`{lang:${cmd.lang}.channel|${msg.prefix}|${member.username}#${member.discriminator}|${compact ? " --compact" : ""}}`
					] : [])
				].join("\n"))
				.toJSON()
		});
	});
