import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"rpg"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	features: ["devOnly"],
	subCommandDir: `${__dirname}/rpg-subcmd`,
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, uConfig, gConfig, this);
}));
