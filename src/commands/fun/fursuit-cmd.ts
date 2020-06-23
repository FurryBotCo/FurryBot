import Command from "../../modules/CommandHandler/Command";
import { FurryBotAPI } from "../../modules/External";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"fursuit"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"attachFiles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await FurryBotAPI.furry.fursuit("json", 1);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`Short URL: <${img.shorturl}>`)
			.setImage(img.url)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.setFooter("powered by furry.bot")
			.toJSON()
	});
}));
