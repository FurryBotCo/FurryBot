import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import truncate from "truncate";
import ReactionQueue from "../../util/queue/ReactionQeueue";
import { setInterval } from "timers";

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

	if (this.activeReactChannels.includes(msg.channel.id)) return msg.reply("There is already an active reaction menu in this channel. Please wait for that one to timeout before starting another.");

	const colors = {
		green: 3066993,
		gold: 15844367,
		red: 15158332
	};

	const tags = msg.args.map(a => a.replace(/,\|/g, "")).filter(t => !t.toLowerCase().startsWith("order:"));
	if (tags.length > 5) return msg.reply("you can only specify up to five (5) tags.");

	const bl = tags.filter(t => config.tagBlacklist.includes(t.toLowerCase()));
	if (bl !== null && bl.length > 0) return msg.channel.createMessage(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);

	const e = await this.e6.listPosts([...tags, "order:score"], 50, 1, null, config.tagBlacklist);

	let currentPost = 1;

	const embed: Eris.EmbedOptions = {
		title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].artist.join(", ")}`,
		url: `https://e621.net/post/show/${e[currentPost - 1].id}`,
		footer: {
			icon_url: "https://e621.net/favicon-32x32.png",
			text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score} - ${currentPost}/${e.length}`
		},
		color: e[currentPost - 1].rating === "s" ? colors.green : e[currentPost - 1].rating === "q" ? colors.gold : colors.red,
		timestamp: new Date().toISOString()
	};

	let ratelimit = false;

	const rl = setInterval(() => ratelimit = false, 3e3);

	if (["jpg", "png", "gif"].includes(e[currentPost - 1].file_ext)) embed.image = {
		width: e[currentPost - 1].width,
		height: e[currentPost - 1].height,
		url: e[currentPost - 1].file_url
	};
	else if (e[currentPost - 1].file_ext === "swf") embed.description = `This post is a flash animation, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;
	else embed.description = `This post appears to be a video, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;
	/*else embed.image = {
		width: e[currentPost - 1].width,
		height: e[currentPost - 1].height,
		url: e[currentPost - 1].file_url
	};*/

	const m = await msg.channel.createMessage({ embed });
	const q = new ReactionQueue(m);

	const r = [
		"⏮",
		"◀",
		"⏹",
		"▶",
		"⏭"
	];

	r.map(e => q.add({ type: "add", user: "@me", reaction: e }));

	let t = setTimeout(setPost.bind(this), 6e4, "EXIT");
	async function setPost(this: FurryBot, p: string | number) {
		if (ratelimit) return msg.reply("You are being ratelimited! Please wait a bit more before navigating posts!").then(m => setTimeout(() => m.delete(), 5e3));
		ratelimit = true;
		clearTimeout(t);
		t = setTimeout(setPost.bind(this), 6e4, "EXIT");

		if (p === "EXIT") {
			clearTimeout(t);
			q.add({
				type: "remove",
				reaction: null,
				user: null
			});
			this.removeListener("messageReactionAdd", f);
			if (q.entries.length > 0) {
				let count = 0;
				const cI = setInterval(async () => {
					if (q.entries.length === 0 || ++count >= 20) {
						q.destroy();
						await m.removeReactions();
						clearInterval(cI);
						clearInterval(rl);
						this.activeReactChannels.splice(this.activeReactChannels.indexOf(msg.channel.id), 1);
					}
				}, 1e2);
			}
		} else currentPost++;

		if (currentPost === 0) currentPost = e.length;
		if (currentPost === e.length + 1) currentPost = 1;

		const embed: Eris.EmbedOptions = {
			title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].artist.join(", ")}`,
			url: `https://e621.net/post/show/${e[currentPost - 1].id}`,
			footer: {
				icon_url: "https://e621.net/favicon-32x32.png",
				text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score} - ${currentPost}/${e.length}`
			},
			color: e[currentPost - 1].rating === "s" ? colors.green : e[currentPost - 1].rating === "q" ? colors.gold : colors.red,
			timestamp: new Date().toISOString()
		};

		if (["jpg", "png", "gif"].includes(e[currentPost - 1].file_ext)) embed.image = {
			width: e[currentPost - 1].width,
			height: e[currentPost - 1].height,
			url: e[currentPost - 1].file_url
		};
		else if (e[currentPost - 1].file_ext === "swf") embed.description = `This post is a flash animation, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;
		else embed.description = `This post appears to be a video, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;

		await m.edit({ embed });

	}

	const f = (async (ms: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, user: string) => {
		if (ms.id !== m.id || user !== msg.author.id || !r.includes(emoji.name)) {
			if (user !== this.user.id && r.includes(emoji.name)) return q.add({
				type: "remove",
				reaction: emoji.id !== null ? `${emoji.name}:${emoji.id}` : emoji.name,
				user
			});
			else return;
		}

		switch (emoji.name) {
			case "⏮":
				await setPost.call(this, 1);
				break;

			case "◀":
				await setPost.call(this, currentPost - 1);
				break;

			case "⏹":
				await setPost.call(this, "EXIT");
				break;

			case "▶":
				await setPost.call(this, currentPost + 1);
				break;

			case "⏭":
				await setPost.call(this, e.length);
				break;

			default:
				return;
		}

		return q.add({
			type: "remove",
			reaction: emoji.name,
			user
		});
	});

	this.on("messageReactionAdd", f);
	this.activeReactChannels.push(msg.channel.id);
}));