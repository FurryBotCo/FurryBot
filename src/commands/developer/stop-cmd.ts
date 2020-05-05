import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"stop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me stop.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.reply("stopping..").then(() => process.exit());
}));
