import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"auto"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.reply("{lang:other.error.commandDisabled}");
}));
