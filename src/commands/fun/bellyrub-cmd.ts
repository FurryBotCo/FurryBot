import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings, Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"bellyrub"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Give someone a nice belly rub -w-",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");

	const text = Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" "));
	if (msg.channel.permissionsOf(this.user.id).has("attachFiles")) msg.channel.createMessage(text, {
		file: await Request.getImageFromURL("https://assets.furry.bot/bellyrub.gif"),
		name: "bellyrub.gif"
	});
	else msg.channel.createMessage(text);
}));
