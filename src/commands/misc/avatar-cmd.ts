import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Utility from "../../util/Functions/Utility";

export default new Command(["avatar"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		const top = msg.member.roles.map(r => msg.channel.guild.roles.get(r)).sort((a, b) => b.position - a.position)[0];
		const color = !top?.color ? Colors.gold : top.color;
		const format = (size: 128 | 256 | 512 | 1024 | 2048 | 4096) => member.user.dynamicAvatarURL(member.user.avatar.startsWith("_a") ? "gif" : "png", size);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(color)
				.setFooter("OwO", this.bot.user.avatarURL)
				.setTitle(`{lang:${cmd.lang}.title|${member.username}#${member.discriminator}}`)
				.setDescription(`[[512x512](${format(512)})] - [[1024x1024](${format(1024)})] - [[2048x2048](${format(2048)})]`)
				.setImage(format(4096))
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
