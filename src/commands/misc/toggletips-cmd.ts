import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"toggletips"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (uConfig.tips) return uConfig.edit({ tips: false }).then(d => d.reload()).then(() => msg.reply("{lang:commands.misc.toggletips.disabled}"));
	else return uConfig.edit({ tips: true }).then(d => d.reload()).then(() => msg.reply("{lang:commands.misc.toggletips.enabled}"));
}));
