import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"rsar",
		"removeselfassignablerole"
	],
	userPermissions: [
		"manageRoles"
	],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 1e3,
	description: "Remove a self assignable role",
	usage: "<@role/role id/role name>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let role, roles;
	role = await msg.getRoleFromArgs();
	if (!role) return msg.errorEmbed("INVALID_ROLE");
	roles = msg.gConfig.selfAssignableRoles;
	if (!roles.includes(role.id)) return msg.channel.createMessage("this role is not listed as a self assignable role.");
	await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: role.id } });
	return msg.channel.createMessage(`Removed **${role.name}** from the list of self assignable roles.`);
}));