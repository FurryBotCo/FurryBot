import FurryBot from "@FurryBot";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import Command from "../../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../../config";
export default new Command({
	triggers: [
		"icon"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 0,
	description: "Change the bots icon (dev only)",
	usage: "<icon url>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	// extra check, to be safe
	if (!config.developers.includes(msg.author.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot run this command as you are not a developer of this bot.`);
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
	const set = await phin({ url: msg.unparsedArgs.join("%20"), parse: "none" }).then(res => `data:${res.headers["content-type"]};base64,${res.body.toString("base64")}`);
	this.editSelf({ avatar: set })
		.then(async (user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set Avatar to (attachment)`, {
			file: await functions.getImageFromURL(user.avatarURL),
			name: "avatar.png"
		}))
		.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
}));