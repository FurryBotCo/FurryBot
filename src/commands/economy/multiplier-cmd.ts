import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { Economy } from "../../util/Functions";
import Eris from "eris";

export default new Command({
	triggers: [
		"multiplier",
		"multi"
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
	let u: Eris.User = msg.author;
	if (msg.args.length > 0) u = await msg.getUserFromArgs();

	if (!u) return msg.errorEmbed("INVALID_USER");
	const { multi, multiStr, list } = await Economy.calculateMulti(u.id, this);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.economy.multiplier.title}")
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.setDescription([
				...list.map(k => `${Economy.multi[k].name}: \`${parseFloat((Economy.multi[k].p * 100).toFixed(2))}%\``),
				"",
				`{lang:commands.economy.multiplier.total}: \`${multiStr}%\``
			].join("\n"))
			.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
	});
}));
