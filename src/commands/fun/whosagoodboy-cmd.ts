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
	return msg.channel.createMessage({
		embed: {
			description: msg.args.length === 0 ? "Yip! Yip! I am!" : `Yip! Yip! ${msg.args.join(" ")} is!`,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		}
	});
}));
