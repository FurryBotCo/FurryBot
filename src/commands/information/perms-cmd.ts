import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import Permissions from "../../util/Permissions";

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
	let allowUser, denyUser, allowBot, denyBot, au, du, ab, db, embed, b;
	b = msg.channel.permissionsOf(this.user.id);
	allowUser = [],
		denyUser = [],
		allowBot = [],
		denyBot = [];

	for (const p in Permissions.constant) {
		if (msg.member.permission.allow & Permissions.constant[p]) allowUser.push(p);
		else denyUser.push(p);
	}

	for (const p in Permissions.constant) {
		if (b.allow & Permissions.constant[p]) allowBot.push(p);
		else denyBot.push(p);
	}

	au = allowUser.length === 0 ? "NONE" : allowUser.join("**, **"),
		du = denyUser.length === Object.keys(Permissions.constant).length ? "NONE" : denyUser.join("**, **"),
		ab = allowBot.length === 0 ? "NONE" : allowBot.join("**, **"),
		db = denyBot.length === Object.keys(Permissions.constant).length ? "NONE" : denyBot.join("**, **");
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