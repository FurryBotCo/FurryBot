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
		"cat"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	description: "Get a picture of a cat!",
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
		return msg.channel.createMessage("", {
			file: await functions.getImageFromURL("https://cataas.com/cat/gif"),
			name: "cat.gif"
		});
	} catch (e) {
		this.logger.error(e);
		return msg.channel.createMessage("unknown api error", {
			file: await functions.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));