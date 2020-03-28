import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import { Request } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";
import UserConfig from "../../modules/config/UserConfig";
import GuildConfig from "../../modules/config/GuildConfig";

export default new Command({
	triggers: [
		"bird",
		"birb"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await Request.imageAPIRequest(true, "birb");
	if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
	return msg.channel.createMessage({
		embed:
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.animals.bird.title}")
				.setDescription(`[{lang:other.imageURL}](${img.response.image})`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setImage(img.response.image)
	});
}));
