import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"hug"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Hug someone!",
	usage: "<@member/text>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	const input = msg.args.join(" ");
	const text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, input);
	if (msg.gConfig.settings.commandImages) {
		if (!msg.channel.permissionsOf(this.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
		const img = await this.f.imageAPIRequest(false, "hug", true, true);
		if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
		msg.channel.createMessage(text, {
			file: await this.f.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} else {
		msg.channel.createMessage(text);
	}
}));
