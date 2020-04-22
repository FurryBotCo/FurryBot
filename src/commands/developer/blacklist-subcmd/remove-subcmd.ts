import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import ExtendedMessage from "@ExtendedMessage";

export default new SubCommand({
	triggers: [
		"remove",
		"-"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Remove users/servers from the blacklist.",
	usage: "<user/server> <id>",
	features: ["contribOnly"],
	subCommandDir: `${__dirname}/remove-subcmd`,
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, uConfig, gConfig, this);
}));
