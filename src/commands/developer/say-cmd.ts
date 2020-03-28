import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"say"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me say something.",
	usage: "<text>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	await msg.delete().catch(err => null);
	return msg.channel.createMessage(msg.unparsedArgs.join(" "));
}));
