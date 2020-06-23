import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import chunk from "chunk";

export default new Command({
	triggers: [
		"rsar",
		"removeselfassignablerole"
	],
	permissions: {
		user: [
			"manageRoles"
		],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const role = await msg.getRoleFromArgs(0, true, true);
	if (!role) return msg.errorEmbed("INVALID_ROLE");
	const roles = gConfig.selfAssignableRoles;
	if (!roles.includes(role.id)) return msg.channel.createMessage("{lang:commands.utility.rsar.notListed}");
	await gConfig.mongoEdit({ $pull: { selfAssignableRoles: role.id } });
	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeSelfAssignableRole", role: role.id, timestamp: Date.now() });
	return msg.channel.createMessage(`{lang:commands.utility.rsar.removed|${role.name}}`);
}));
