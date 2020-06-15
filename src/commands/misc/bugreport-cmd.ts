import Command from "../../modules/CommandHandler/Command";

export default new Command({
	triggers: [
		"bugreport"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 18e5,
	donatorCooldown: 18e5,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.reply("{lang:commands.misc.bugreport.moved}");
}));
