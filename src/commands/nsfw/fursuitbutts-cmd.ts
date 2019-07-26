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
		"fursuitbutts"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	description: "See some fursuit booties!",
	usage: "",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let img, short, extra;
	img = await phin({
		url: "https://api.fursuitbutts.com/butts",
		parse: "json"
	});

	if (img.statusCode !== 200) {
		this.logger.error(img);
		return msg.channel.createMessage(`<@!${msg.author.id}>, Unknown api error.`);
	}
	short = await functions.shortenURL(img.body.response.image);
	extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await functions.getImageFromURL(img.body.response.image),
		name: img.body.response.name
	});
}));