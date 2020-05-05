import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"russianroulette",
		"rr"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const val = Math.floor(Math.random() * 6);
	const bullets = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 3;

	return msg
		.reply(val <= bullets - 1 ? "{lang:commands.fun.russianroulette.die}" : "{lang:commands.fun.russianroulette.live}");
}));
