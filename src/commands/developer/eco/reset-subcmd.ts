import FurryBot from "@FurryBot";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import Command from "../../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../../config";
import { mdb } from "../../../modules/Database";
import userConfig from "../../../default/userConfig.json";
import UserConfig from "../../../modules/config/UserConfig";


export default new Command({
	triggers: [
		"reset"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Reset a users balance",
	usage: "<@user/id>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const u = await msg.getUserFromArgs();

	if (!u) return msg.reply("I couldn't find that user.");

	let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

	if (!d) {
		await mdb.collection("users").insertOne({ id: u.id, ...userConfig });

		d = await mdb.collection("users").findOne({ id: u.id });
	}

	d = new UserConfig(u.id, d);

	await d.edit({ bal: userConfig.bal }).then(d => d.reload());

	return msg.reply(`reset the balance of **${u.username}#${u.discriminator}** (${u.id})`);
}));