import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"dshard"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Manage the bots shards.",
	usage: "<disconnect/connect/status/restart> <id>",
	features: ["helperOnly"],
	subCommandDir: `${__dirname}/dshard-subcmd`,
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, uConfig, gConfig, this);
}));
