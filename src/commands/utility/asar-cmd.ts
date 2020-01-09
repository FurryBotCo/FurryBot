import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

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
	cooldown: 3e3,
	donatorCooldown: 2e3,
	description: "Add a self assignable role.",
	usage: "<@role/id/name>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const role = await msg.getRoleFromArgs(0, true, true);
	if (!role) return msg.errorEmbed("INVALID_ROLE");
	const a = this.f.compareMemberWithRole(msg.member, role);
	const b = this.f.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
	if ((a.higher || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot add roles as high as, or higher than you.`);
	if (b.higher || b.same) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
	if (role.managed) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
	const roles = msg.gConfig.selfAssignableRoles;
	if (roles.includes(role.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is already listed as a self assignable role.`);
	await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $push: { selfAssignableRoles: role.id } });
	// await msg.gConfig.modlog.add({ blame: msg.author.id, action: "addSelfAssignableRole", role: role.id, timestamp: Date.now() });
	return msg.channel.createMessage(`<@!${msg.author.id}>, Added **${role.name}** to the list of self assignable roles.`);
}));
