import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"bellyrub"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Give someone a nice belly rub -w-",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");

	return msg
		.channel
		.createMessage({
			embed: {
				description: Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" ")),
				image: {
					url: "https://assets.furry.bot/bellyrub.gif"
				},
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				timestamp: new Date().toISOString(),
				color: Math.floor(Math.random() * 0xFFFFFF)
			}
		});
}));
