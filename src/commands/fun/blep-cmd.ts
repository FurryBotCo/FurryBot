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
		"blep"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	description: "Do a blep!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

	try {
		const img = await functions.imageAPIRequest(true, "blep");
		return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`, {
			file: await functions.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} catch (e) {
		this.logger.error(e);
		return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`, {
			file: await functions.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));