import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";
import config from "../../config";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"spray"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"externalEmojis"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.fun.spray.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}\n${config.emojis.spray}${config.emojis.spray}${config.emojis.spray}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.toJSON()
	});
}));
