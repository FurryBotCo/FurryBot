import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"unban",
		"ub"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 2e3,
	description: "Remove bans for people that have been previously banned in your server",
	usage: "<id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, embed, reason;
	// get member from message
	if (!msg.args[0]) return msg.channel.createMessage("Please provide a user id.");

	user = this.users.has(msg.args[0]) ? this.users.get(msg.args[0]) : await this.getRESTUser(msg.args[0]).catch(error => false);

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (!(await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
			embed = {
				title: "User not banned",
				description: `It doesn't look like ${user.username}#${user.discriminator} is banned here..`
			};
			Object.assign(embed, msg.embed_defaults());
			return msg.channel.createMessage({ embed });
		}
	}

	reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
		msg.channel.createMessage(`***Unbanned ${user.username}#${user.discriminator}, ${reason}***`).catch(noerr => null);
	}).catch(async (err) => {
		msg.channel.createMessage(`I couldn't unban **${user.username}#${user.discriminator}**, ${err}`);
	});

	if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));