import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import Eris from "eris";

export default new Command({
	triggers: [
		"slowmode"
	],
	userPermissions: [
		"manageChannels"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const s = Number(msg.args[0]);
	if (isNaN(s) || s < 0 || s > 21600) return msg.reply("{lang:commands.utility.slowmode.invalid}");
	const ch = msg.args.length > 1 ? await msg.getChannelFromArgs<Eris.TextChannel>(1) : msg.channel;
	if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
	if (s === ch.rateLimitPerUser) return msg.reply(`{lang:commands.utility.slowmode.unchanged|${ch.id}}`);

	await ch.edit({ rateLimitPerUser: s }, `Command: ${msg.author.tag}`);

	return msg.reply(s === 0 ? `{lang:commands.utility.slowmode.remove|${ch.id}}` : `{lang:commands.utility.slowmode.set|${ch.id}|${s}|${s === 1 ? "\u200b" : "s"}}`);
}));
