import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings, Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"bap"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Bap someone! Ouch!",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	const text = Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" "));

	if (msg.channel.permissionsOf(this.user.id).has("attachFiles")) return msg.channel.createMessage(text, {
		file: await Request.getImageFromURL("https://assets.furry.bot/bap.gif"),
		name: "bap.gif"
	});
	else return msg.channel.createMessage(text);

}));
