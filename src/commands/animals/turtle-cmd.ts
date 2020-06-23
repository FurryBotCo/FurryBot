import Command from "../../modules/CommandHandler/Command";
import { Request } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"turtle"
	],
	permissions: {
		user: [],
		bot: [
			"attachFiles",
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await Request.chewyBotAPIRequest("turtle");

	if (!img) return msg.reply("{lang:other.errors.imageAPI}");
	return msg.channel.createMessage({
		embed:
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.animals.turtle.title}")
				.setDescription(`[{lang:other.words.imageURL}](${img})`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setImage(img)
				.toJSON()
	});
}));
