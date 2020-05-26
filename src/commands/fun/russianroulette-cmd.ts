import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";
import config from "../../config";

export default new Command({
	triggers: [
		"russianroulette",
		"rr"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const val = Math.floor(Math.random() * 6);
	const bullets = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 3;

	return msg.reply(val <= bullets - 1 ? "{lang:commands.fun.russianroulette.die}" : "{lang:commands.fun.russianroulette.live}");
}));
