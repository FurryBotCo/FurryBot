import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"8ball"
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
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.fun.8ball.title|${msg.author.tag}}`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.fun.8ball.said}: **{lang:commands.fun.8ball.possible}**.`)
			.setFooter(`{lang:commands.fun.8ball.disclaimer}`, config.images.botIcon)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
	});
}));
