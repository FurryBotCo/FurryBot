import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"dadjoke",
		"joke"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 4e3,
	description: "Get a dadjoke!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

	let req, j;
	req = await phin({
		method: "GET",
		url: "https://icanhazdadjoke.com",
		headers: {
			"Accept": "application/json",
			"User-Agent": config.web.userAgent
		}
	});
	try {
		j = JSON.parse(req.body);
	} catch (e) {
		await msg.channel.createMessage("Cloudflare is being dumb and rejecting our requests, please try again later.");
		this.logger.error(req.body);
		await msg.channel.createMessage(`This command has been permanently disabled until Cloudflare stops giving us captchas, join our support server for updates on the status of this: <https://furry.bot/inv>.`);
		return this.logger.error(e);
	}

	return msg.channel.createMessage(j.joke);
}));