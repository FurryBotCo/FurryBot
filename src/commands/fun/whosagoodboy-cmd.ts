import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"whosagoodboy",
		"whosagoodboi",
		"goodboy",
		"goodboi"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(msg.args.length === 0 ? "{lang:commands.fun.whosagoodboy.me}" : `{lang:commands.fun.whosagoodboy.other|${Internal.extraArgParsing(msg)}}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.toJSON()
	});
}));
