import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"asar",
		"addselfassignablerole"
	],
	userPermissions: [
		"manageRoles"
	],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 1e3,
	description: "Add a self assignable role",
	usage: "<@role/role id/role name>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let role, roles, a, b;
	role = await msg.getRoleFromArgs(0, true, true);
	if (!role) return msg.errorEmbed("INVALID_ROLE");
	a = functions.compareMemberWithRole(msg.member, role);
	b = functions.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
	if ((a.higher || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot add roles as high as, or higher than you.`);
	if (b.higher || b.same) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
	if (role.managed) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
	roles = msg.gConfig.selfAssignableRoles;
	if (roles.includes(role.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is already listed as a self assignable role.`);
	await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $push: { selfAssignableRoles: role.id } });
	return msg.channel.createMessage(`<@!${msg.author.id}>, Added **${role.name}** to the list of self assignable roles.`);
}));