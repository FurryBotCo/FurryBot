import Command from "../../modules/CommandHandler/Command";
import { FurryBotAPI } from "../../modules/External";
import EmbedBuilder from "../../util/EmbedBuilder";


export default new Command({
	triggers: [
		"bird",
		"birb"
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
	const img = await FurryBotAPI.animals.birb("json", 1);
	return msg.channel.createMessage({
		embed:
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.animals.bird.title}")
				.setDescription(`[{lang:other.words.imageURL}](${img.url})`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setImage(img.url)
				.toJSON()
	});
}));
