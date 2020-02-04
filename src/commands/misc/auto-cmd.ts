import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"auto"
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
	description: "Toggle automated posting of content in a channel.",
	usage: "",
	features: ["premiumGuildOnly"],
	subCommandDir: `${__dirname}/auto-subcmd`,
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, this);
}));
