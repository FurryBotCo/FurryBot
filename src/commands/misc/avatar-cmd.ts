import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["avatar", "av"], __filename)
	.setBotPermissions([
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		const top = msg.member.roles.map(r => msg.channel.guild.roles.get(r)!).sort((a, b) => b.position - a.position)[0];
		const color = !top?.color ? Colors.gold : top.color;
		const format = (size: 128 | 256 | 512 | 1024 | 2048 | 4096) => member.user.dynamicAvatarURL(member.user.avatar!.startsWith("a_") ? "gif" : "png", size);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(color)
				.setFooter("OwO", this.client.user.avatarURL)
				.setTitle(`{lang:${cmd.lang}.title|${member.username}#${member.discriminator}}`)
				.setDescription(`[[512x512](${format(512)})] - [[1024x1024](${format(1024)})] - [[2048x2048](${format(2048)})]`)
				.setImage(format(4096))
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
