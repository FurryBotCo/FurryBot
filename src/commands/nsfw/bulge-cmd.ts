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
		"bulge",
		"bulgie"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "*notices bulge* OwO",
	usage: "",
	features: ["nsfw"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const img = await this.f.imageAPIRequest(false, "bulge", true, false);
	if (img.success !== true) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, img);
		return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
	}
	const short = await this.f.shortenURL(img.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await this.f.getImageFromURL(img.response.image),
		name: img.response.name
	});
}));
