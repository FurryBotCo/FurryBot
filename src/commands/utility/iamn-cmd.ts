import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"iamn",
		"iamnot",
		"rolemenot"
	],
	userPermissions: [],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	description: "Remove a self assignable role from yourself.",
	usage: "<role>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	const roles = msg.gConfig.selfAssignableRoles.map(a => {
		const b = msg.channel.guild.roles.get(a);
		if (!b) return { id: null, name: null };
		return { name: b.name.toLowerCase(), id: a };
	});
	if (!roles.map(r => r.name).includes(msg.args.join(" ").toLowerCase())) {
		if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is not self assignable.`);
		return msg.channel.createMessage(`<@!${msg.author.id}>, Role not found.`);
	}
	let role;
	role = roles.filter(r => r.name === msg.args.join(" ").toLowerCase());
	if (!role || role.length === 0) return msg.channel.createMessage("Role not found.");
	role = role[0];
	if (!msg.member.roles.includes(role.id)) return msg.channel.createMessage("You don't have this role.");
	const a = this.f.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
	if (a.higher || a.same) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is higher than, or as high as my highest role.`);
	await msg.member.removeRole(role.id, "iamnot command");

	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeRole", role: role.id, reason: "iamnot command", userId: msg.author.id, timestamp: Date.now() });
	return msg.channel.createMessage(`<@!${msg.author.id}>, You no longer have the **${role.name}** role.`);
}));
