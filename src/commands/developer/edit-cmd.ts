import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"edit"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Edit stuff about the bot.",
	usage: "<icon/name/game/status>",
	features: ["devOnly"],
	subCommandDir: `${__dirname}/edit-subcmd`,
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, uConfig, gConfig, this);
}));
