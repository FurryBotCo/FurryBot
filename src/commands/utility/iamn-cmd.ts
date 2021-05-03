import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { BotFunctions, Command, CommandError } from "core";
import Language from "language";
import Eris from "eris";

// If Discord ever makes arguments dynamic, I'll make a slash command for this
export default new Command<FurryBot, UserConfig, GuildConfig>(["iamn", "rolemenot"], __filename)
	.setBotPermissions([
		"manageRoles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) throw new CommandError("INVALID_USAGE", cmd);
		//                                                                                                       to remove undefined
		const roles = msg.gConfig.selfAssignableRoles.map(a => msg.channel.guild.roles.get(a)).filter(Boolean) as Array<Eris.Role>;

		if (!roles.map(r => r.name.toLowerCase()).includes(msg.args.join(" ").toLowerCase())) {
			if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notAssignable`));
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound`));
		}
		const role = roles.find(r => r && r.name.toLowerCase() === msg.args.join(" ").toLowerCase());
		if (!role || roles.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound`));
		if (msg.member.roles.includes(role.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyHave`, [msg.prefix]));
		const a = BotFunctions.compareMemberWithRole(msg.channel.guild.me, msg.channel.guild.roles.get(role.id)!);
		if (a.lower || a.same) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.higher`));
		await msg.member.addRole(role.id, encodeURIComponent(`iam command: ${msg.author.tag} (${msg.author.id})`));

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.given`, [role.name]));
	});
