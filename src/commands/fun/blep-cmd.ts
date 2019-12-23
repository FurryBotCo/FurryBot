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
		"blep"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Give someone a nice belly rub -w-",
	usage: "<@member/text>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	try {
		const img = await this.f.imageAPIRequest(true, "blep");
		if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
		return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`, {
			file: await this.f.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} catch (e) {
		Logger.error(e, msg.guild.shard.id);
		return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`, {
			file: await this.f.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
