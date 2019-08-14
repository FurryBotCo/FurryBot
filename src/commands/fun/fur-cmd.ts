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
		"fur"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	description: "Get a random fur image! use **fur list** to get a list of all supported types!",
	usage: "[type]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
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
		req = await functions.imageAPIRequest(false, type, true, true);
		short = await functions.shortenURL(req.response.image);
		extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
		return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nType: ${this.ucwords(type)}`, {
			file: await functions.getImageFromURL(req.response.image),
			name: req.response.name
		});
	} catch (error) {
		this.logger.error(`Error:\n${error}`);
		this.logger.log(`Body: ${req}`);
		return msg.channel.createMessage("Unknown API Error", {
			file: await functions.getImageFromURL("https://fb.furcdn.net/NotFound.png"),
			name: "NotFound.png"
		});
	}
}));