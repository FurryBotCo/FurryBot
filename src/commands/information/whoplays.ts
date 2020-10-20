import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import CommandError from "../../util/cmd/CommandError";

export default new Command(["whoplays"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		// if (msg.channel.guild.memberCount < 1000 && msg.channel.guild.members.size !== msg.channel.guild.memberCount) await msg.channel.guild.fetchAllMembers();
		let l = msg.channel.guild.members.filter(m => m.game && m.game.name.toLowerCase().indexOf(msg.args.join(" ").toLowerCase()) !== -1), limit = false;
		const len = l.length;
		if (len > 15) (l = [], limit = true);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title|${msg.args.join(" ")}}`)
				.setDescription([
					`{lang:${cmd.lang}.total|${len}}`,
					"",
					...l.map(m => `${m.username}#${m.discriminator} (<@!${m.id}>)`),
					...(limit ? [`{lang:${cmd.lang}.limit}`] : [])
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setFooter("OwO", this.bot.user.avatarURL)
				.toJSON()
		});
	});
