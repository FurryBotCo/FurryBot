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
		"rsar",
		"removeselfassignablerole"
	],
	userPermissions: [
		"manageRoles"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 2e3,
	description: "Remove a self assignable role",
	usage: "<@role/id/name>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const role = await msg.getRoleFromArgs(0, true, true);
	if (!role) return msg.errorEmbed("INVALID_ROLE");
	const roles = msg.gConfig.selfAssignableRoles;
	if (!roles.includes(role.id)) return msg.channel.createMessage("this role is not listed as a self assignable role.");
	await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: role.id } });
	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeSelfAssignableRole", role: role.id, timestamp: Date.now() });
	return msg.channel.createMessage(`Removed **${role.name}** from the list of self assignable roles.`);
}));
