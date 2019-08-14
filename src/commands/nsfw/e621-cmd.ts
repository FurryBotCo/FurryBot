import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";
import truncate from "truncate";

export default new Command({
	triggers: [
		"e621",
		"e6"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"attachFiles"
	],
	cooldown: 3e3,
	description: "Get some content from E621!",
	usage: "[tags]",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let tags, bl, req, embed, postNumber, post;
	tags = encodeURIComponent(msg.args.map(a => a.replace(/,\|/g, "")).join(" "));
	bl = tags.match(config.tagBlacklist);
	if (bl !== null && bl.length > 0) return msg.channel.createMessage(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
	try {
		req = await phin({
			url: `https://e621.net/post/index.json?limit=50&tags=${tags}%20rating%3Aexplict`,
			headers: {
				"User-Agent": config.web.userAgentExt("Donovan_DMC"),
				"Content-Type": "application/json"
			}
		}).then(res => res.body.toString());
		if (req.indexOf("block.opendns.com") !== -1) return msg.reply("This command is blocked on the current network the bot is being ran on.");
		req = JSON.parse(req);
	} catch (e) {

		await msg.channel.createMessage("There was an unknown error while doing this.");
		this.logger.error(e);
		return this.logger.error(req);
	}

	if (req.success !== undefined && req.success === false) return msg.channel.createMessage(`<@!${msg.author.id}>, error while running command: ${req.reason}`);
	if (req.length === 0) {
		embed = {
			title: "No Posts Found",
			description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`
		};
		Object.assign(embed, msg.embed_defaults());
		return msg.channel.createMessage({ embed });
	}
	postNumber = Math.floor(Math.random() * req.length);
	post = req[postNumber];
	if (!post) post = req[0];
	bl = post.tags.match(config.tagBlacklist);
	if (![undefined, null, ""].includes(bl) && bl.length === 1) {
		this.logger.warn(`Blacklisted e621 post found, https://e621.net/post/show/${post.id}, blacklisted tag: ${bl[0]}`);
		return msg.channel.createMessage(`<@!${msg.author.id}>, I couldn't return the result as it contained blacklisted a tag.\nBlacklisted Tag: **${bl[0]}**`);
	} else if (![undefined, null, ""].includes(bl) && bl.length > 1) {
		this.logger.warn(`Blacklisted e621 post found, https://e621.net/post/show/${post.id}, blacklisted tags: ${bl.join(", ")}`);
		return msg.channel.createMessage(`<@!${msg.author.id}>, I couldn't return the result as it contained blacklisted tags.\nBlacklisted Tags: **${bl.join("**, **")}**`);
	}
	embed = {
		title: "E621 Yiff!",
		description: `Tags: ${truncate(post.tags.replace("_", "\\_"), 1900)}\n\nLink: <https://e621.net/post/show/${post.id}>`,
		image: {
			url: post.file_url
		}
	};
	return msg.channel.createMessage({ embed });
}));