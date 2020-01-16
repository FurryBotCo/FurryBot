import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings, Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"kiss"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Kiss someone 0.0",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	const input = msg.args.join(" ");
	const text = Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, input);
	if (msg.gConfig.settings.commandImages) {
		if (!msg.channel.permissionsOf(this.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
		const img = await Request.imageAPIRequest(false, "kiss", true, true);
		if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
		msg.channel.createMessage(text, {
			file: await Request.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} else {
		msg.channel.createMessage(text);
	}
}));
