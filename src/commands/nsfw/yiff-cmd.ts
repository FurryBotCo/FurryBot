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
		"yiff"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get some yiff!",
	usage: "[gay/straight/lesbian/dickgirl]",
	features: ["nsfw"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	let extra = "", type;
	if (msg.args.length === 0) {
		for (const ytype of config.yiff.types) {
			if (msg.channel.name.indexOf(ytype) !== -1) type = ytype;
		}

		if (!type) {
			type = config.yiff.types[0];
			if (!this.yiffNoticeViewed.has(msg.channel.guild.id)) {
				this.yiffNoticeViewed.add(msg.channel.guild.id);
				extra += `Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${config.yiff.types.join("**, **")}**.\n\n`;
			}
		}

	} else {
		type = msg.args.join(" ");
		if (!config.yiff.types.includes(type)) {
			const embed: Eris.EmbedOptions = {
				title: "Invalid yiff type",
				description: `The type you provided **${type}** is invalid, valid types are: **${config.yiff.types.join("**, **")}**.`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				color: Math.floor(Math.random() * 0xFFFFFF)
			};

			return msg.channel.createMessage({ embed });
		}
	}

	const img = await this.f.imageAPIRequest(false, `yiff/${type}`, true, false);

	if (img.success !== true) {
		if (typeof img.error === "object") return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		else return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\n${img.error}`);
	}
	const short = await this.f.shortenURL(img.response.image);
	extra += short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await this.f.getImageFromURL(img.response.image),
		name: img.response.name
	});
}));
