import Command from "../../modules/CommandHandler/Command";
import { Utility } from "../../util/Functions";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"iam"
	],
	permissions: {
		user: [],
		bot: [
			"manageRoles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) throw new CommandError("ERR_INVALID_USAGE", cmd);
	const roles = gConfig.selfAssignableRoles.map(a => {
		const b = msg.channel.guild.roles.get(a);
		if (!b) return { id: null, name: null };
		return { name: b.name.toLowerCase(), id: a };
	});
	if (!roles.map(r => r.name).includes(msg.args.join(" ").toLowerCase())) {
		if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.reply(`{lang:commands.utility.iam.notAssignable}`);
		return msg.reply("{lang:commands.utility.iam.notFound}");
	}
	let role;
	role = roles.filter(r => r.name === msg.args.join(" ").toLowerCase());
	if (!role || role.length === 0) return msg.reply("{lang:commands.utility.iam.notFund}");
	role = role[0];
	if (msg.member.roles.includes(role.id)) return msg.reply(`{lang:commands.utility.iam.alreadyHave|${gConfig.settings.prefix}}`);
	const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), role);
	if (a.higher || a.same) return msg.reply("{lang:commands.utility.iam.higher}");
	await msg.member.addRole(role.id, "iam command");

	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeRole", role: role.id, reason: "iamnot command", userId: msg.author.id, timestamp: Date.now() });
	return msg.reply(`{lang:commands.utility.iam.given|${role.name}}`);
}));
