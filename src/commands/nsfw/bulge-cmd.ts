import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Logger } from "../../util/LoggerV8";
import { Request, Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"bulge",
		"bulgie"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "*notices bulge* OwO",
	usage: "",
	features: ["nsfw"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	const img = await Request.imageAPIRequest(false, "bulge", true, false);
	if (img.success === false) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, img);
		return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
	}
	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";

	return msg.channel.createMessage({
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
