import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import Permissions from "@util/Permissions";

export default new Command({
	triggers: [
		"perms",
		"listperms"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Check your own and the bots permissions",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let allow_user, deny_user, allow_bot, deny_bot, au, du, ab, db, embed, b;
	b = msg.channel.permissionsOf(this.user.id);
	allow_user = [],
		deny_user = [],
		allow_bot = [],
		deny_bot = [];

	for (let p in Permissions.constant) {
		if (msg.member.permission.allow & Permissions.constant[p]) allow_user.push(p);
		else deny_user.push(p);
	}

	for (let p in Permissions.constant) {
		if (b.allow & Permissions.constant[p]) allow_bot.push(p);
		else deny_bot.push(p);
	}

	au = allow_user.length === 0 ? "NONE" : allow_user.join("**, **"),
		du = deny_user.length === Object.keys(Permissions.constant).length ? "NONE" : deny_user.join("**, **"),
		ab = allow_bot.length === 0 ? "NONE" : allow_bot.join("**, **"),
		db = deny_bot.length === Object.keys(Permissions.constant).length ? "NONE" : deny_bot.join("**, **");
	embed = {
		title: "Permission Info",
		fields: [
			{
				name: "User",
				value: `__Allow__:\n**${au.length === 0 ? "NONE" : au
					}**\n\n\n__Deny__:\n**${du.length === 0 ? "NONE" : du}**`,
				inline: false
			}, {
				name: "Bot",
				value: `__Allow__:\n**${ab.length === 0 ? "NONE" : ab}**\n\n\n__Deny__:\n**${db.length === 0 ? "NONE" : db}**`,
				inline: false
			}
		]
	};
	Object.assign(embed, msg.embed_defaults());
	return msg.channel.createMessage({ embed });
}));