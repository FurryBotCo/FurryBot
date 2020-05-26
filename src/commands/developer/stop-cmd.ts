import Command from "../../modules/CommandHandler/Command";

export default new Command({
	triggers: [
		"stop"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.reply("stopping..").then(() => process.exit());
}));
