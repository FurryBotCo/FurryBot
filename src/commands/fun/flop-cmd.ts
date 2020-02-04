import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"flop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Flop onto someone! OwO",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");

	return msg.channel.createMessage({
		embed: {
			description: Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" ")),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		}
	});
}));
