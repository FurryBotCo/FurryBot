import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, CommandError, EmbedBuilder } from "core";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["whoplays"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		// if (msg.channel.guild.memberCount < 1000 && msg.channel.guild.members.size !== msg.channel.guild.memberCount) await msg.channel.guild.fetchAllMembers();
		const global = msg.dashedArgs.value.includes("global");
		let l: Array<Eris.User | Eris.Member> = [], limit = false;
		if (global) {
			for (const [, g] of this.bot.guilds) {
				const v = g.members.filter(m => m.game! && m.game.name.toLowerCase().indexOf(msg.args.join(" ").toLowerCase()) !== -1);
				limit = false;
				l.push(...v);
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			l = msg.channel.guild.members.filter(m => m.game! && m.game.name.toLowerCase().indexOf(msg.args.join(" ").toLowerCase()) !== -1);
			limit = false;
		}
		const len = l.length;
		if (len > 15) (l = [], limit = true); // eslint-disable-line @typescript-eslint/no-unused-expressions
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title${global ? "Global" : ""}|${msg.args.join(" ")}}`)
				.setDescription([
					`{lang:${cmd.lang}.total|${len}}`,
					"",
					...l.map(m => `${m.username}#${m.discriminator} (<@!${m.id}>)`),
					...(limit ? [`{lang:${cmd.lang}.limit}`] : []),
					...(global ? [] : [`{lang:${cmd.lang}.globalNote}`])
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setFooter("OwO", this.bot.user.avatarURL)
				.toJSON()
		});
	});
