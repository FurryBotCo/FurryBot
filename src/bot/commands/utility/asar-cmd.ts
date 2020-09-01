import Command from "../../../util/cmd/Command";
import Utility from "../../../util/Functions/Utility";
import Language from "../../../util/Language";

export default new Command(["asar"], __filename)
	.setBotPermissions([
		"manageRoles"
	])
	.setUserPermissions([
		"manageRoles"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const role = await msg.getRoleFromArgs(0, true);
		if (!role) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_ROLE", true)
		});
		const a = Utility.compareMemberWithRole(msg.member, role);
		const b = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), role);
		if ((a.higher || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.reply("{lang:commands.utility.asar.higherUser}");
		if (b.lower || b.same) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.higherBot`));
		if (role.managed) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.managed`));
		const roles = msg.gConfig.selfAssignableRoles;
		if (roles.includes(role.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyListed`));
		await msg.gConfig.mongoEdit({ $push: { selfAssignableRoles: role.id } });
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.added`, [role.name]));
	});
