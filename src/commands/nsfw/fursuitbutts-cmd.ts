import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import { Utility, Request } from "../../util/Functions";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"fursuitbutts",
		"fursuitbutt"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "See some fursuit booties!",
	usage: "",
	features: ["nsfw"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	const img = await phin({
		method: "GET",
		url: "https://api.fursuitbutts.com/butts",
		parse: "json",
		timeout: 5e3
	});

	if (img.statusCode !== 200) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, img);
		return msg.channel.createMessage(`<@!${msg.author.id}>, Unknown api error.`);
	}
	const short = await Utility.shortenURL(img.body.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";

	return msg.channel.createMessage({
		embed: {
			color: Colors.gold,
			description: `${extra}Short URL: <${short.link}>`,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			image: {
				url: img.body.response.image
			},
			timestamp: new Date().toISOString(),
			footer: {
				text: "powered by furry.bot"
			}
		}
	});
}));
