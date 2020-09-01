import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import CommandError from "../../../util/cmd/CommandError";
import Internal from "../../../util/Functions/Internal";
import { Colors } from "../../../util/Constants";

export default new Command(["bap"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const rand = msg.channel.guild.members.filter(m => m.id !== msg.author.id);
		const r = rand[Math.floor(Math.random() * rand.length)];
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}|${r.username}#${r.discriminator}}`)
				.setImage("https://assets.furry.bot/bap.gif")
				.setTimestamp(new Date().toISOString())
				.setFooter("\u200b", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
