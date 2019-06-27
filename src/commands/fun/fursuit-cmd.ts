import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"fursuit"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	description: "Get a random fursuit image!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let img, short, extra;
	img = await functions.imageAPIRequest(false, "fursuit", true, true);
	if (img.success !== true) return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
	short = await functions.shortenURL(img.response.image);
	extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	msg.channel.createMessage(`${extra}Short URL: <${short.link}${config.beta ? "?beta" : ""}>\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await functions.getImageFromURL(img.response.image),
		name: img.response.name
	});
}));