import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Request, Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"fursuit"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get a random fursuit image!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const img = await Request.imageAPIRequest(false, "fursuit", true, true);
	if (img.success !== true) return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg
		.channel
		.createMessage({
			embed: {
				color: Colors.gold,
				description: `${extra}Short URL: <${short.link}>`,
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				image: {
					url: img.response.image
				},
				timestamp: new Date().toISOString(),
				footer: {
					text: "powered by furry.bot"
				}
			}
		});
}));
