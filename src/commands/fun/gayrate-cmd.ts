import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["gayrate"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(5e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const member = msg.args.length < 1 ? msg.member : await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title|${member.username}#${member.discriminator}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.percent${member.id === msg.author.id ? "Self" : "Other"}|<@!${member.id}>|${Math.floor(Math.random() * 100)}}`)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.client.user.avatarURL)
				.setColor(Colors.furry)
				.toJSON()
		});
	});
