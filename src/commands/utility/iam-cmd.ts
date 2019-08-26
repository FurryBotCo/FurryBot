import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"iam",
		"roleme"
	],
	userPermissions: [],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 5e3,
	description: "Get a self assignable role",
	usage: "<role>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let roles, b, a, role;
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	roles = msg.gConfig.selfAssignableRoles.map(a => {
		b = msg.channel.guild.roles.get(a);
		if (!b) return { id: null, name: null };
		return { name: b.name.toLowerCase(), id: a };
	});
	if (!roles.map(r => r.name).includes(msg.args.join(" ").toLowerCase())) {
		if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.channel.createMessage(`<@!${msg.author.id}>,That role is not self assignable.`);
		return msg.channel.createMessage(`<@!${msg.author.id}>, Role not found.`);
	}
	role = roles.filter(r => r.name === msg.args.join(" ").toLowerCase());
	if (!role || role.length === 0) return msg.channel.createMessage(`<@!${msg.author.id}>, Role not found.`);
	role = role[0];
	if (msg.member.roles.includes(role.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, You already have this role.`);
	a = functions.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
	if (a.higher || a.same) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is higher than, or as high as my highest role.`);
	await msg.member.addRole(role.id, "iam command");
	return msg.channel.createMessage(`<@!${msg.author.id}>, You now have the **${role.name}** role.`);
}));