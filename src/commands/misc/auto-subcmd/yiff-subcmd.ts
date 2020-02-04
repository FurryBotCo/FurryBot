import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new SubCommand({
	triggers: [
		"yiff"
	],
	userPermissions: [
		"manageChannels",
		"manageGuild"
	],
	botPermissions: [
		"attachFiles",
		"embedLinks",
		"manageWebhooks"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Toggle automated posting of yiff in a channel.",
	usage: "<enable/disable> <gay/straight/lesbian/dickgirl> <5m/10m/15m/30m/60m>",
	features: ["nsfw", "premiumGuildOnly"],
	subCommandDir: `${__dirname}/yiff-subcmd`,
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: SubCommand) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, this);
}));
