import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"invite",
		"inv",
		"discord"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("Discord")
			.setDescription(`[Support Server](${config.client.socials.discord})\n[Add Me To A Server](${config.client.invite.url})`)
			.setThumbnail(config.images.defaultAvatar)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.toJSON()
	});
}));
