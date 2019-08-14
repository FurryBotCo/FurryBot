import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@src/modules/Database";
import userConfig from "@src/default/userConfig.json";
import UserConfig from "@src/modules/config/UserConfig";


export default new Command({
	triggers: [
		"set"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Set a users balance",
	usage: "<@user/id> <amount>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");

	const u = await msg.getUserFromArgs();

	if (!u) return msg.reply("I couldn't find that user.");

	let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

	if (!d) {
		await mdb.collection("users").insertOne({ id: u.id, ...userConfig });

		d = await mdb.collection("users").findOne({ id: u.id });
	}

	d = new UserConfig(u.id, d);

	const oldBal = d.bal;

	const amount = parseInt(msg.args[1], 10);

	if (isNaN(amount) || amount < 1) return msg.reply("second parameter must be a positive integer.");

	await d.edit({ bal: amount }).then(d => d.reload());

	return msg.reply(`set the balance of **${u.username}#${u.discriminator}** (${u.id}) to ${amount}\nOld Balance: ${oldBal}`);
}));