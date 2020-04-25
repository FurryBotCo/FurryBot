import SubCommand from "../../../util/CommandHandler/lib/SubCommand";

export default new SubCommand({
	triggers: [
		"check"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a user/server is blacklisted.",
	usage: "<user/server> <id>",
	features: ["contribOnly"],
	subCommandDir: `${__dirname}/check-subcmd`,
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, uConfig, gConfig, this);
}));
