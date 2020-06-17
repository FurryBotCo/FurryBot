import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { FurryBotAPI, E6API } from "../../modules/External";
import Eris from "eris";
import FurryBot from "../../main";
import config from "../../config";

export default new Command({
	triggers: [
		"e621",
		"e6"
	],
	permissions: {
		user: [],
		bot: [
			"attachFiles",
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [
		"nsfw"
	],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (!msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) await msg.channel.createMessage("Warning: this command may not function properly without the `manageMessages` permission!");
	if (this.holder.has("react", null, msg.channel.id) && !config.developers.includes(msg.author.id)) return msg.reply("{lang:other.errors.duplicatePagination}");

	const tags = msg.args.map(a => a.replace(/,\|/g, ""));
	if (tags.length > 40) return msg.reply("you can only specify up to fourty (40) tags.");

	const bl = tags.filter(t => config.tagBlacklist.includes(t.toLowerCase()));
	if (bl !== null && bl.length > 0) return msg.channel.createMessage(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
	if (!tags.some(t => t.match(new RegExp("order:(((score|tagcount|desclength|comments|mpixels|filesize|set)(_asc|_desc)?)|(id|landscape|portrait))", "gi")))) tags.push("order:score");

	const e = await E6API.listPosts(tags, 50, 1, null, config.tagBlacklist);

	if (e.length === 0) return msg.reply("your search returned no results.");

	let currentPost = 1;

	const embed: Eris.EmbedOptions = {
		title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].tags.artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].tags.artist.join(", ")}`,
		url: `https://e621.net/post/show/${e[currentPost - 1].id}`,
		footer: {
			icon_url: "https://e621.net/favicon-32x32.png",
			text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score.total} - ${currentPost}/${e.length}`
		},
		color: e[currentPost - 1].rating === "s" ? Colors.green : e[currentPost - 1].rating === "q" ? Colors.gold : Colors.red,
		timestamp: new Date().toISOString()
	};

	let ratelimit = false;

	const rl = setInterval(() => ratelimit = false, 3e3);

	if (["jpg", "png", "gif"].includes(e[currentPost - 1].file.ext)) embed.image = {
		url: e[currentPost - 1].file.url
	};
	else if (e[currentPost - 1].file.ext === "swf") embed.description = `This post is a flash animation, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;
	else embed.description = `This post appears to be a video, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;
	/*else embed.image = {
		width: e[currentPost - 1].width,
		height: e[currentPost - 1].height,
		url: e[currentPost - 1].file_url
	};*/

	const m = await msg.channel.createMessage({ embed });
	const inst = await msg.channel.createMessage(`To navigate posts, you can reply with one of the following:\n**first**, **back**, **stop**, **next**, **last**.`);

	const f = (async () => {
		const d = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id || m.member.permission.has("administrator"), 1);
		if (!d || !d.content) return setPost.call(this, "EXIT");
		if (d.author.id !== msg.author.id && (d.content.toLowerCase() !== "stop" || !d.member.permission.has("administrator"))) d.content = "continue";

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

			case "continue":
			default:
				return f();
		}

		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) await d.delete().catch(() => null);

		return f();
	});

	async function setPost(this: FurryBot, p: "EXIT");
	async function setPost(this: FurryBot, p: number);
	async function setPost(this: FurryBot, p: string | number) {
		if (ratelimit && !config.developers.includes(msg.author.id)) return msg.reply("you are being ratelimited! Please wait a bit more before navigating posts!").then(m => setTimeout(() => m.delete().catch(() => null), 5e3)).catch(() => null);
		ratelimit = true;

		if (p === "EXIT") {
			clearTimeout(rl);
			await inst.edit("Navigating not active, it either timed out or the starter exited.");
			this.holder.remove("react", null, msg.channel.id);
			return;
		} else currentPost = p as number;

		if (currentPost === 0) currentPost = e.length;
		if (currentPost === e.length + 1) currentPost = 1;

		const embed: Eris.EmbedOptions = {
			title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].tags.artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].tags.artist.join(", ")}`,
			url: `https://e621.net/post/show/${e[currentPost - 1].id}`,
			footer: {
				icon_url: "https://e621.net/favicon-32x32.png",
				text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score.total} - ${currentPost}/${e.length}`
			},
			color: e[currentPost - 1].rating === "s" ? Colors.green : e[currentPost - 1].rating === "q" ? Colors.gold : Colors.red,
			timestamp: new Date().toISOString()
		};

		if (["jpg", "png", "gif"].includes(e[currentPost - 1].file.ext)) embed.image = {
			url: e[currentPost - 1].file.url
		};
		else if (e[currentPost - 1].file.ext === "swf") embed.description = `This post is a flash animation, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;
		else embed.description = `This post appears to be a video, please directly view [the post](https://e621.net/post/show/${e[currentPost - 1].id}) on e621`;

		await m.edit({ embed });
	}

	this.holder.add("react", null, msg.channel.id);

	f();

	return;
}));
