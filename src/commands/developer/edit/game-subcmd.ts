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
		"game"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots game",
	usage: "<type> <game>",
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
	if (msg.args.length <= 1) return new Error("ERR_INVALID_USAGE");
	let type;
	switch (msg.args[0].toLowerCase()) {
		case "playing":
			type = 0;
			break;

		case "streaming":
			type = 1;
			break;

		case "listening":
			type = 2;
			break;

		case "watching":
			type = 3;
			break;

		default:
			return msg.channel.createMessage(`<@!${msg.author.id}>, invalid type. Possible types: **playing**, **listening**, **watching**, **streaming**.`);
	}
	msg.args.shift();
	let status = this.shards.get(0).presence.status;
	// this.shards.get(0).presence.status
	// this.guilds.filter(g => g.members.has(this.user.id))[0].members.get(this.user.id).status
	if (!status) status = "online";

	if (type === 1) return this.editStatus(status, { url: msg.args.shift(), name: msg.args.join(" "), type });
	else return this.editStatus(status, { name: msg.args.join(" "), type });
	// this.editStatus("online", { name: msg.args.join(" "),type })
}));