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
		"linkroulette",
		"lr"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Fetch a random short url - high chance to be nsfw!",
	usage: "",
	features: ["nsfw"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let s: any[] | any = await mongo.db("furrybot").collection("shorturl").find().toArray();

	if (s.length === 0) return msg.reply("No results were found.");

	s = s[Math.floor(Math.random() * s.length)];
	if (!s) return msg.reply("Command produced an invalid selection.");

	const embed: Eris.EmbedOptions = {
		title: "Link Roulette",
		description: `[${s.link}](${s.link}) - **Link #${s.linkNumber}**`,
		color: Math.floor(Math.random() * 0xFFFFFF),
		timestamp: new Date().toISOString(),
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		}
	};

	return msg.channel.createMessage({ embed });
}));
