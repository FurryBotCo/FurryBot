import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

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
	donatorCooldown: 3e3,
	description: "Get some content from E621!",
	usage: "[tags]",
	features: ["nsfw"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	if (this.activeReactChannels.includes(msg.channel.id) && !config.developers.includes(msg.author.id)) return msg.reply("There is already an active paginated command in this channel. Please either wait for that one to time out, or say **stop** to stop it.");

	const tags = msg.args.map(a => a.replace(/,\|/g, ""));
	if (tags.length > 5) return msg.reply("you can only specify up to five (5) tags.");

	const bl = tags.filter(t => config.tagBlacklist.includes(t.toLowerCase()));
	if (bl !== null && bl.length > 0) return msg.channel.createMessage(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
	if (!tags.some(t => t.match(new RegExp("order:(((score|tagcount|desclength|comments|mpixels|filesize|set)(_asc|_desc)?)|(id|landscape|portrait))", "gi")))) tags.push("order:score");

	const e = await this.e6.listPosts(tags, 50, 1, null, config.tagBlacklist);

	if (e.length === 0) return msg.reply("Your search returned no results.");

	let currentPost = 1;

	const embed: Eris.EmbedOptions = {
		title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].artist.join(", ")}`,
		url: `https://e621.net/post/show/${e[currentPost - 1].id}`,
		footer: {
			icon_url: "https://e621.net/favicon-32x32.png",
			text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score} - ${currentPost}/${e.length}`
		},
		color: e[currentPost - 1].rating === "s" ? Colors.green : e[currentPost - 1].rating === "q" ? Colors.gold : Colors.red,
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
	const inst = await msg.channel.createMessage(`To navigate posts, you can reply with one of the following:\n**first**, **back**, **stop**, **next**, **last**.`);

	const f = (async () => {
		const d = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
		if (!d) return setPost.call(this, "EXIT");

		switch (d.content.toLowerCase()) {
			case "first":
				setPost.call(this, 1);
				break;

			case "back":
				setPost.call(this, currentPost - 1);
				break;

			case "stop":
			case "exit":
			case "cancel":
				return setPost.call(this, "EXIT");
				break;

			case "next":
				setPost.call(this, currentPost + 1);
				break;

			case "last":
				setPost.call(this, e.length);
				break;

			default:
				return;
		}

		if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) await d.delete().catch(err => null);

		return f();
	});

	async function setPost(this: FurryBot, p: "EXIT");
	async function setPost(this: FurryBot, p: number);
	async function setPost(this: FurryBot, p: string | number) {
		if (ratelimit && !config.developers.includes(msg.author.id)) return msg.reply("You are being ratelimited! Please wait a bit more before navigating posts!").then(m => setTimeout(() => m.delete().catch(err => null), 5e3)).catch(err => null);
		ratelimit = true;

		if (p === "EXIT") {
			clearTimeout(rl);
			await inst.edit("Navigating not active, it either timed out or the starter exited.");
			this.activeReactChannels.splice(this.activeReactChannels.indexOf(msg.channel.id), 1);
			return;
		} else currentPost = p as number;

		if (currentPost === 0) currentPost = e.length;
		if (currentPost === e.length + 1) currentPost = 1;

		const embed: Eris.EmbedOptions = {
			title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].artist.join(", ")}`,
			url: `https://e621.net/post/show/${e[currentPost - 1].id}`,
			footer: {
				icon_url: "https://e621.net/favicon-32x32.png",
				text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score} - ${currentPost}/${e.length}`
			},
			color: e[currentPost - 1].rating === "s" ? Colors.green : e[currentPost - 1].rating === "q" ? Colors.gold : Colors.red,
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

	this.activeReactChannels.push(msg.channel.id);

	f();

	return;
}));
