import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["iamn"], __filename)
	.setBotPermissions([
		"manageRoles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) throw new CommandError("ERR_INVALID_USAGE", cmd);
		const roles = msg.gConfig.selfAssignableRoles.map(a => msg.channel.guild.roles.get(a)).filter(a => a);

		if (!roles.map(r => r.name.toLowerCase()).includes(msg.args.join(" ").toLowerCase())) {
			if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notAssignable`));
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound`));
		}
		const role = roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase());
		if (!roles || roles.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound`));
		if (!msg.member.roles.includes(role.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notHave`, [msg.gConfig.settings.prefix]));
		const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(role.id));
		if (a.lower || a.same) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.higher`));
		await msg.member.removeRole(role.id, "iamn command");

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.removed`, [role.name]));
	});
