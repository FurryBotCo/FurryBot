import Command from "../../util/cmd/Command";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["rsar"], __filename)
	.setBotPermissions([])
	.setUserPermissions([
		"manageRoles"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const role = await msg.getRoleFromArgs();
		if (!role) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_ROLE", true)
		});
		if (!msg.gConfig.selfAssignableRoles.includes(role.id)) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notListed`));
		await msg.gConfig.mongoEdit({ $pull: { selfAssignableRoles: role.id } });
		return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.removed`, [role.name]));
	});
