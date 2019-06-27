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
		"russianroulette",
		"roulette",
		"rr"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Play russian roulette",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let val, bullets;
	val = Math.floor(Math.random() * 6);
	bullets = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 3;

	if (val <= bullets - 1) return msg.channel.createMessage(`<@!${msg.author.id}>, You died!`);
	return msg.channel.createMessage(`<@!${msg.author.id}>, You lived!`);
}));