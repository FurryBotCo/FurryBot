import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"pounce"
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
	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setAuthor(msg.author.tag, msg.author.avatarURL)
		.setDescription(`{lang:commands.fun.pounce.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
		.setTimestamp(new Date().toISOString())
		.setColor(Math.floor(Math.random() * 0xFFFFFF))
		.setImage("https://assets.furry.bot/pounce.gif");

	return msg.channel.createMessage({
		embed
	});
}));
