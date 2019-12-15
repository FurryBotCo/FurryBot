import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"fur"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get a random fur image! Use **fur list** to get a list of valid types.",
	usage: "[type/list]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const types = [
		"boop",
		"cuddle",
		"fursuit",
		"hold",
		"hug",
		"kiss",
		"lick",
		"propose"
	];
	let ln, type, req, short, extra;
	if (msg.args.length === 0) {
		ln = Math.floor(Math.random() * (types.length));
		// 0 (1) - 25: Inkbunny
		type = types[Math.floor(ln / 25)];
	} else {
		type = msg.args[0].toLowerCase();
		if (type === "list") return msg.channel.createMessage(`<@!${msg.author.id}>, Valid Values:\n**${types.join("**\n**")}**.`);
	}
	try {
		if (!type) type = "hug";
		req = await this.f.imageAPIRequest(false, type, true, true);
		short = await this.f.shortenURL(req.response.image);
		extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
		return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nType: ${this.f.ucwords(type)}`, {
			file: await this.f.getImageFromURL(req.response.image),
			name: req.response.name
		});
	} catch (error) {
		Logger.error(`Error:\n${error}`, msg.guild.shard.id);
		Logger.log(`Body: ${req}`, msg.guild.shard.id);
		return msg.channel.createMessage("Unknown API Error", {
			file: await this.f.getImageFromURL("https://fb.furcdn.net/NotFound.png"),
			name: "NotFound.png"
		});
	}
}));
