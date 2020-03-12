import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Request, Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"yiff"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get some yiff!",
	usage: "[gay/straight/lesbian/dickgirl]",
	features: ["nsfw"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// await msg.channel.startTyping();
	let type, content = "";
	if (msg.args.length === 0) {
		for (const ytype of config.yiff.types) {
			if (msg.channel.name.indexOf(ytype) !== -1) type = ytype;
		}

		if (!type) {
			type = msg.gConfig.settings.defaultYiff;
			if (!config.yiff.types.includes(type)) {
				await msg.gConfig.edit({
					settings: {
						defaultYiff: config.yiff.types[0]
					}
				});
				content = `The default type "${msg.gConfig.settings.defaultYiff}" set by this servers settings is invalid, is has been changed to the config set default "${config.yiff.types[0]}".`;
			}
			/*if (!this.yiffNoticeViewed.has(msg.channel.guild.id)) {
				this.yiffNoticeViewed.add(msg.channel.guild.id);
				content = `Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${config.yiff.types.join("**, **")}**.\n\n`;
			}*/
		}

	} else {
		type = msg.args.join(" ");
		if (!config.yiff.types.includes(type)) return msg.channel.createMessage({
			embed: {
				title: "Invalid yiff type",
				description: `The type you provided **${type}** is invalid, valid types are: **${config.yiff.types.join("**, **")}**.`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				color: Math.floor(Math.random() * 0xFFFFFF)
			}
		});
	}

	const img = await Request.imageAPIRequest(false, `yiff/${type}`, true, false);

	if (img.success !== true) {
		if (typeof img.error === "object") return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		else return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\n${img.error}`);
	}
	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";

	return msg.channel.createMessage({
		content,
		embed: {
			color: Colors.gold,
			description: `${extra}Short URL: <${short.link}>\nType: ${type}`,
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
