import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { FurryBotAPI } from "../../modules/External";

export default new Command({
	triggers: [
		"bulge"
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
	restrictions: [
		"nsfw"
	],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await FurryBotAPI.furry.bulge("json", 1);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setDescription(`{lang:other.words.shortURL}: <${img.shorturl}>`)
			.setTitle("{lang:commands.nsfw.bulge.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setImage(img.url)
			.setFooter("{lang:other.poweredBy.furrybot}")
			.toJSON()
	});
}));
