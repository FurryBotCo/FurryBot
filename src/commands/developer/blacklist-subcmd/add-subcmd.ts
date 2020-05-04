import SubCommand from "../../../util/CommandHandler/lib/SubCommand";

export default new SubCommand({
	triggers: [
		"add",
		"+"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Add a user/server to the blacklist.",
	usage: "<user/server> <id> [reason]",
	features: ["helperOnly"],
	subCommandDir: `${__dirname}/add-subcmd`,
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, uConfig, gConfig, this);
}));
