import SubCommand from "../../../util/CommandHandler/lib/SubCommand";

export default new SubCommand({
	triggers: [
		"locations"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	features: ["devOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig) {

}));
