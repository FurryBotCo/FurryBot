import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"dice"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	features: [],
	file: __filename
}, (async function (this, msg, uConfig, gConfig) {
	const min = typeof msg.args[0] !== "undefined" ? Number(msg.args[0]) : 1;
	const max = typeof msg.args[1] !== "undefined" ? Number(msg.args[1]) : 20;

	if (min > max) return msg.reply("{lang:commands.fun.dice.minLess}");

	return msg.reply(`you rolled a ${Math.floor(Math.random() * (max - min)) + min}!`);
}));
