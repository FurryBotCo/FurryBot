import FurryBot from "@FurryBot";
import ExtendedMessage from "../../../../modules/extended/ExtendedMessage";
import Command from "../../../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../../../config/config";
import { mdb } from "../../../../modules/Database";
import GuildConfig from "../../../../modules/config/GuildConfig";

export default new Command({
	triggers: [
		"servers",
		"s",
		"guilds",
		"g"
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
	const entries: GuildConfig[] = await mdb.collection("guilds").find({ "blacklist.blacklisted": true }).toArray();

	if (entries.length === 0) return msg.reply("no entries found");
	const e = [];

	let page = 1;

	if (msg.args.length > 0) page = parseInt(msg.args[0], 10);

	for (const en of entries) {
		let s;
		if (this.guilds.has(en.id)) s = await this.getRESTGuild(en.id);
		else s = null;

		if (!s) e.push(`\`${en.id}\` - ${en.blacklist.reason}`);
		else e.push(`\`${s.name}\` (\`${en.id}\`) - ${en.blacklist.reason}`);
	}

	const ee = [];

	let i = 0;
	for (const entry of e) {
		if ([undefined, null, ""].includes(ee[i])) ee[i] = [];

		if (ee[i].join("\n").length >= 1950 || ee[i].join("\n").length + entry.length >= 1950) i++;
		ee[i].push(entry);
	}

	if (ee.length === 0) return msg.reply("no entries found");

	if (page < 1 || page > ee.length) return msg.reply(`Invalid page number ${page}, valid: 1-${ee.length}`);

	const embed = {
		title: `Server Blacklist List ${page}/${ee.length}`,
		description: ee[page - 1].join("\n"),
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};
	return msg.channel.createMessage({ embed });
}));