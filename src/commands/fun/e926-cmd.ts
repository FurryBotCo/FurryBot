import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import truncate from "truncate";

export default new Command({
	triggers: [
		"e926",
		"e9"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	description: "Get some fur images from e926",
	usage: "[tags]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let tags, bl, req, embed: Eris.EmbedOptions, postNumber, post;
	tags = encodeURIComponent(msg.args.join(" "));
	bl = tags.match(config.tagBlacklist);
	if (bl !== null && bl.length > 0) return msg.reply(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
	try {
		req = await phin({
			url: `https://e926.net/post/index.json?limit=50&tags=${tags}%20rating%3Asafe`,
			headers: {
				"User-Agent": config.web.userAgentExt("Donovan_DMC"),
				"Content-Type": "application/json"
			}
		}).then(res => JSON.parse(res.body.toString()));
	} catch (e) {
		await msg.channel.createMessage("unknown error while doing this..");
		return this.logger.error(e);
	}
	if (req.success !== undefined && req.success === false) return msg.reply(`error while running command: ${req.reason}`);
	if (req.length === 0) {
		embed = {
			title: "No Posts Found",
			description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`,
			color: functions.randomColor(),
			timestamp: new Date().toISOString()
		};

		return msg.channel.createMessage({
			embed
		});
	}
	postNumber = Math.floor(Math.random() * req.length);
	post = req[postNumber];
	if (!post) post = req[0];
	if (post.tags.length !== 0) bl = post.tags.match(config.tagBlacklist);
	if (![undefined, null, ""].includes(bl) && bl.length === 1) {
		this.logger.warn(`Blacklisted e926 post found, https://e926.net/post/show/${post.id}, blacklisted tag: ${bl[0]}`);
		return msg.reply(`I couldn't return the result as it contained blacklisted a tag: **${bl[0]}**`);
	} else if (![undefined, null, ""].includes(bl) && bl.length > 1) {
		this.logger.warn(`Blacklisted e926 post found, https://e926.net/post/show/${post.id}, blacklisted tags: ${bl.join(", ")}`);
		return msg.reply(`I couldn't return the result as it contained blacklisted tags: **${bl.join("**, **")}**`);
	}
	if (!["s", "safe"].includes(post.rating.toLowerCase())) return msg.reply(`API returned a non sfw image, please use the \`e621\` command if you are expecting nsfw results.`);
	embed = {
		title: "E926 Furs!",
		description: `Tags: ${truncate(post.tags.replace("_", "\\_"), 1900)}\n\nLink: <https://e926.net/post/show/${post.id}>`,
		image: {
			url: post.file_url
		}
	};
	return msg.channel.createMessage({
		embed
	});
}));