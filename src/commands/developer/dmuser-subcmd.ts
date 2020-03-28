import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"dmuser"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Send a direct message to a user.",
	usage: "<id> <message>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	if (msg.args.length > 0) return new Error("ERR_INVALID_USAGE");

	const user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const dm = await user.getDMChannel();

	if (!dm) return msg.reply(`failed to fetch dm channel for **${user.username}#${user.discriminator}** (${user.id})`);

	const m = await dm.createMessage(msg.args.slice(1, msg.args.length).join(" ")).catch(err => null);

	if (!m) return msg.reply(`failed to dm **${user.username}#${user.discriminator}** (${user.id}), they might have their dms closed.`);

	return msg.reply(`sent direct message "${msg.args.slice(1, msg.args.length).join(" ")}" to **${user.username}#${user.discriminator}** (${user.id})`);
}));
