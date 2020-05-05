import Command from "../../util/CommandHandler/lib/Command";
import { Request } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"turtle"
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
}, (async function (msg, uConfig, gConfig) {
	const img = await Request.chewyBotAPIRequest("turtle");

	if (!img) return msg.reply("failed to fetch image from api, please try again later.");
	return msg.channel.createMessage({
		embed:
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.animals.turtle.title}")
				.setDescription(`[{lang:other.imageURL}](${img})`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setImage(img)
	});
}));
