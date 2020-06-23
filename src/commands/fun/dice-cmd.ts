import Command from "../../modules/CommandHandler/Command";

export default new Command({
	triggers: [
		"dice"
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
	const min = typeof msg.args[0] !== "undefined" ? Number(msg.args[0]) : 1;
	const max = typeof msg.args[1] !== "undefined" ? Number(msg.args[1]) : 20;

	if (min > max) return msg.reply("{lang:commands.fun.dice.minLess}");

	return msg.reply(`you rolled a ${Math.floor(Math.random() * (max - min)) + min}!`);
}));
