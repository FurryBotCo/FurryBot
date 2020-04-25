import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import { Utility } from "../../util/Functions";

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
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const role = await msg.getRoleFromArgs(0, true, true);
	if (!role) return msg.errorEmbed("INVALID_ROLE");
	const a = Utility.compareMemberWithRole(msg.member, role);
	const b = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), role);
	if ((a.higher || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.reply(`{lang:commands.utility.asar.higherUser}`);
	if (b.lower || b.same) return msg.reply(`{lang:commands.utility.asar.higherBot}`);
	if (role.managed) return msg.reply(`{lang:commands.utility.asar.managed}`);
	const roles = gConfig.selfAssignableRoles;
	if (roles.includes(role.id)) return msg.reply(`{lang:commands.utility.asar.alreadyListed}`);
	await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $push: { selfAssignableRoles: role.id } });
	// await msg.gConfig.modlog.add({ blame: msg.author.id, action: "addSelfAssignableRole", role: role.id, timestamp: Date.now() });
	return msg.reply(`{lang:commands.utility.asar.added|${role.name}}`);
}));
