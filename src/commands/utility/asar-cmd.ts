import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["asar"], __filename)
	.setBotPermissions([
		"manageRoles"
	])
	.setUserPermissions([
		"manageRoles"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const role = await msg.getRoleFromArgs(0, true);
		if (!role) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_ROLE", true)
		});
		const a = BotFunctions.compareMemberWithRole(msg.member, role);
		const b = BotFunctions.compareMemberWithRole(msg.channel.guild.me, role);
		if ((a.lower || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.higherUser`));
		if (b.lower || b.same) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.higherBot`));
		if (role.managed) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.managed`));
		const roles = msg.gConfig.selfAssignableRoles;
		if (roles.includes(role.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyListed`));
		await msg.gConfig.mongoEdit({ $push: { selfAssignableRoles: role.id } });
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.added`, [role.name]));
	});
