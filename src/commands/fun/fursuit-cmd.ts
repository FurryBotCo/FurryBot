import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Request, Utility } from "../../util/Functions";

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
	// await msg.channel.startTyping();
	const img = await Request.imageAPIRequest(false, "fursuit", true, true);
	if (img.success !== true) return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await Request.getImageFromURL(img.response.image),
		name: img.response.name
	});
}));
