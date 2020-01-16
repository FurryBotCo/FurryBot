import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"whosagoodboy",
		"whosagoodboi",
		"goodboy",
		"goodboi"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	donatorCooldown: .5e3,
	description: "Who's a good boy?!",
	usage: "[@user]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) return msg.channel.createMessage("Yip! Yip! I am!");
	else return msg.channel.createMessage(`Yip! Yip! ${msg.args.join(" ")} is!`);
}));
