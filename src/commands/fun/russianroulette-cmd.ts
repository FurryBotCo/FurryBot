import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"russianroulette",
		"roulette",
		"rr"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Play Russian Roulette!",
	usage: "[bullets]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const val = Math.floor(Math.random() * 6);
	const bullets = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 3;

	if (val <= bullets - 1) return msg.channel.createMessage(`<@!${msg.author.id}>, You died!`);
	return msg.channel.createMessage(`<@!${msg.author.id}>, You lived!`);
}));
