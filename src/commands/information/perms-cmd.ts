import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
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
	donatorCooldown: 1e3,
	description: "Check your permissions, and my permissions.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const allowUser = [],
		denyUser = [],
		allowBot = [],
		denyBot = [],
		b = msg.channel.permissionsOf(this.user.id);

	for (const p in Permissions.constant) {
		if (msg.member.permission.allow & Permissions.constant[p]) allowUser.push(p);
		else denyUser.push(p);
	}

	for (const p in Permissions.constant) {
		if (b.allow & Permissions.constant[p]) allowBot.push(p);
		else denyBot.push(p);
	}

	const au = allowUser.length === 0 ? "NONE" : allowUser.join("**, **");
	const du = denyUser.length === Object.keys(Permissions.constant).length ? "NONE" : denyUser.join("**, **");
	const ab = allowBot.length === 0 ? "NONE" : allowBot.join("**, **");
	const db = denyBot.length === Object.keys(Permissions.constant).length ? "NONE" : denyBot.join("**, **");
	const embed: Eris.EmbedOptions = {
		title: "Permission Info",
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
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
		],
		timestamp: new Date().toISOString(),
		color: Math.floor(Math.random() * 0xFFFFFF)
	};

	return msg.channel.createMessage({ embed });
}));
