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
		"giphy",
		"gif"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get a gif from giphy",
	usage: "<keywords>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	const rq = await phin({
		method: "GET",
		url: `https://api.giphy.com/v1/gifs/search?api_key=${config.apis.giphy.apikey}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
		parse: "json",
		timeout: 5e3
	});

	if (rq.body.data.length === 0) return msg.reply(`No results were found for "${msg.args.join(" ")}".`);
	const embed: Eris.EmbedOptions = {
		title: `Results for "${msg.args.join(" ")}" on giphy`,
		thumbnail: {
			url: "attachment://PoweredByGiphy.png"
		},
		image: {
			url: rq.body.data[Math.floor(Math.random() * rq.body.data.length)].images.fixed_width.url
		},
		footer: {
			text: "These results are not curated by us!"
		}
	};

	return msg.channel.createMessage({ embed }, {
		file: await this.f.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
		name: "PoweredByGiphy.png"
	});
}));
