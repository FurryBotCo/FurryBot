import FurryBot from "@FurryBot";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import Command from "../../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../../config/config";

export default new Command({
	triggers: [
		"name",
		"username"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots username",
	usage: "<username>",
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
	let set;
	set = msg.unparsedArgs.join(" ");
	if (set.length < 2 || set.length > 32) return msg.channel.createMessage("Username must be between **2** and **32** characters.");
	this.editSelf({ username: set })
		.then((user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set username to: ${user.username}`))
		.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
}));