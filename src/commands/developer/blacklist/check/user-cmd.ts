import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import UserConfig from "@src/modules/config/UserConfig";

export default new Command({
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let u, id, usr: UserConfig;
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	id = u.id;
	usr = await mdb.collection("users").findOne({ id });
	if (!usr) {
		console.debug(`Created user entry for ${id}`);
		await mdb.collection("users").insertOne(Object.assign(config.defaults.userConfig, { id }));
		usr = await mdb.collection("users").findOne({ id });
	}

	if (!usr) return msg.reply(`Failed to create user entry for **${id}**`);
	if (usr.blacklist.blacklisted) return msg.reply(`**${u.username}#${u.discriminator}** (${id}) is blacklisted, reason: ${usr.blacklist.reason}.`);
	else return msg.reply(`**${u.username}#${u.discriminator}** (${id}) is not blacklisted.`);
}));