import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"updates"
	],
	userPermissions: [],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 1.5e3,
	description: "Toggle your update notifications",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let role = this.guilds.get(config.bot.mainGuild).roles.get("591755500085968903"); // Furry Bot (Section) in Don's Lounge (247488777621209091)
	if (!role) return msg.channel.createMessage(`<@!${msg.author.id}>, updates role was not found, please notify an admin.`);
	if (msg.member.roles.includes(role.id)) return msg.member.removeRole(role.id)
		.then(() => msg.reply("I've unsubscibed you from announcements, run this again to resume notifications."))
		.catch((err) => msg.reply(`Role removal failed: ${err}`));
	else return msg.member.addRole(role.id)
		.then(() => msg.reply("I've subscibed you to announcements, run this again to stop notifications."))
		.catch((err) => msg.reply(`Role addition failed: ${err}`));
}));