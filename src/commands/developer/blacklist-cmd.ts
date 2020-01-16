import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"blacklist",
		"bl"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Manage the bots blacklist.",
	usage: "<add/check/list/remove> [user(s)/server(s)] [id] [reason]",
	features: ["devOnly"],
	subCommandDir: `${__dirname}/blacklist-subcmd`,
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, this);
}));
