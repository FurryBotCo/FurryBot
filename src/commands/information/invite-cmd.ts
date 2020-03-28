import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";

export default new Command({
	triggers: [
		"invite",
		"inv",
		"discord"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("Discord")
			.setDescription(`[Support Server](${config.bot.supportURL})\n[Add Me To A Server](${config.bot.addURL})`)
			.setThumbnail(config.images.defaultAvatar)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(msg.author.tag, msg.author.avatarURL)
	});
}));
