import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import { mdb } from "../../modules/Database";
import UserConfig from "../../modules/config/UserConfig";

export default new Command({
	triggers: [
		"baltop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Check out the richest people on this bot!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

	return msg.reply("this command has not been released yet!");

	/*const count = await mdb.collection("users").countDocuments();
	const m = await msg.channel.createMessage(`Please be patient, this may take a bit, counting **${count}** users..`);

	const users: UserConfig[] = await mdb.collection("users").find({}).toArray();

	users.map(u => {
		if (!u.bal) u.bal = 100;
		return u;
	}).sort((a, b) => a.bal < b.bal ? 1 : a.bal > b.bal ? -1 : 0);

	const d = [];

	for (const u of users) {
		if (d.length === 10) break;

		const usr: Eris.User = this.users.has(u.id) ? this.users.get(u.id) : await this.getRESTUser(u.id).catch(err => null);
		if (!usr || usr.bot) continue;

		d.push(`#${d.length + 1} **${usr.username}#${usr.discriminator}** - \`${u.bal || 100}\``);
	}

	const embed: Eris.EmbedOptions = {
		title: "Richest Users",
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		description: d.join("\n"),
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};

	return m.edit({ content: "", embed });*/
}));