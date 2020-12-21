import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Utility from "../../util/Functions/Utility";

export default new Command(["gayrate"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const member = msg.args.length < 1 ? msg.member : await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title|${member.username}#${member.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.percent${member.id === msg.author.id ? "Self" : "Other"}|<@!${member.id}>|${Math.floor(Math.random() * 100)}}`)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
