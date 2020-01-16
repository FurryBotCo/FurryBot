import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Request, Strings } from "../../util/Functions";
import Logger from "../../util/LoggerV8";

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
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	const text = Strings.formatStr(Strings.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, msg.args.join(" "));
	if (msg.gConfig.settings.commandImages) {
		if (!msg.channel.permissionsOf(this.user.id).has("attachFiles")) return msg.reply(`hey, I require the \`attachFiles\` permission for images to work on these commands!`);
		const img = await Request.imageAPIRequest(true, "boop");
		if (img.success === false) {
			Logger.error(`Shard #${msg.channel.guild.shard.id}`, img.error);
			return msg.reply(`internal image api error, please try again later.`);
		}
		return msg.channel.createMessage(text, {
			file: await Request.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} else return msg.channel.createMessage(text);
}));
