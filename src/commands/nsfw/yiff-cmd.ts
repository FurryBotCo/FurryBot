import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Request, Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

// @FIXME lang
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
	features: ["nsfw"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	// await msg.channel.startTyping();
	let type, content = "";
	if (msg.args.length === 0) {
		for (const ytype of config.yiff.types) {
			if (msg.channel.name.indexOf(ytype) !== -1) type = ytype;
		}

		if (!type) {
			type = gConfig.settings.defaultYiff;
			if (!config.yiff.types.includes(type)) {
				await gConfig.edit({
					settings: {
						defaultYiff: config.yiff.types[0]
					}
				});
				content = `The default type "${gConfig.settings.defaultYiff}" set by this servers settings is invalid, is has been changed to the config set default "${config.yiff.types[0]}".`;
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
		if (typeof img.error === "object")
			return msg.reply(`{lang:other.error.unknownAPIError|${img.error.code}|${img.error.description}}`);
		else return msg.reply(`{lang:other.error.codeAPIError|${img.error}}`);
	}
	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `{lang:other.firstTimeViewed|${short.linkNumber}}\n` : "";

	return msg.channel.createMessage({
		content,
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setDescription(`${extra}{lang:other.shortURL}: <${short.link}>`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setImage(img.response.image)
			.setFooter("{lang:other.poweredBy.furrybot}")
	}).catch(err => null);
}));
