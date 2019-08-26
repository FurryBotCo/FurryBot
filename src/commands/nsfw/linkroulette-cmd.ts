import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import { mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"linkroulette",
		"lr"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Fetches a random short url - high chance to be nsfw!",
	usage: "",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let embed;

	let s: any[] | any = await mongo.db("furrybot").collection("shorturl").find().toArray();

	if (s.length === 0) return msg.reply("No results were found.");

	s = s[Math.floor(Math.random() * s.length)];
	if (!s) return msg.reply("Command produced an invalid selection.");

	embed = {
		title: "Link Roulette",
		description: `[${s.link}](${s.link}) - **Link #${s.linkNumber}**`
	};

	Object.assign(embed, msg.embed_defaults());

	return msg.channel.createMessage({ embed });
}));