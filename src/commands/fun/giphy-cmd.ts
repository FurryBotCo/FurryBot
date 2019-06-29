import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"giphy",
		"gif"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get a gif from giphy.",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let embed, rq;
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	rq = await phin({
		method: "GET",
		url: `https://api.giphy.com/v1/gifs/search?api_key=${config.apis.giphy.apikey}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
		parse: "json"
	});

	if (rq.body.data.length === 0) return msg.reply(`No results were found for "${msg.args.join(" ")}".`);
	embed = {
		title: `Results for "${msg.args.join(" ")}" on giphy`,
		thumbnail: {
			url: "attachment://PoweredByGiphy.png"
		},
		image: {
			url: rq.body.data[Math.floor(Math.random() * rq.body.data.length)].images.fixed_width.url
		}
	};

	return msg.channel.createMessage({ embed }, {
		file: await functions.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
		name: "PoweredByGiphy.png"
	});
}));