import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import Redis from "../../../util/Redis";

export default new Command(["afk"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(6e4, true)
	.setExecutor(async function (msg, cmd) {
		const type = msg.args.length === 0 || msg.args[0].toLowerCase() !== "global" ? "server" : "global";
		await Redis.set(`afk:${type === "server" ? `servers:${msg.channel.guild.id}` : "global"}:${msg.author.id}`, Date.now());
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title${type === "global" ? "Global" : ""}}`)
				.setDescription(`{lang:${cmd.lang}.done${type === "global" ? "Global" : ""}}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("\u200b", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
