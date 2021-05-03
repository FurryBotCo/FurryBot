import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { BotFunctions, Command, CommandError } from "core";
import Language from "language";
import Eris from "eris";

// If Discord ever makes arguments dynamic, I'll make a slash command for this
export default new Command<FurryBot, UserConfig, GuildConfig>(["iam", "roleme"], __filename)
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

		const l = roles.filter(r => r.name.toLowerCase().indexOf(msg.args.join(" ").toLowerCase()) !== -1);
		if (l.length === 0) {
			if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notAssignable`));
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound`));
		}
		let i = 0;
		if (l.length > 1) {
			await msg.reply({
				content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.ambiguous`, [msg.args.join(" "), l.map((a, b) => `**${b+1}.)** <@&${a.id}>`).join("\n")]),
				allowedMentions: {
					roles: false
				}
			});
			const mg = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
			if (mg === null) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.collectionTimeout"));
			if (mg.content.toLowerCase() === "cancel") return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.userCancelled"));
			const a = !mg.content ? NaN : Number(mg.content);
			if (isNaN(a) || a < 1 || a > l.length) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.errors.invalidSelection", [1, l.length]));
			i = a - 1;
			/* await v.edit({
				content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.use`, [l[i].id]),
				messageReferenceID: mg.id,
				allowedMentions: {
					roles: false
				}
			}); */
			void mg.delete().catch(() => null);
		}
		const role = l[i];
		if (msg.member.roles.includes(role.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyHave`, [msg.prefix]));
		const a = BotFunctions.compareMemberWithRole(msg.channel.guild.me, msg.channel.guild.roles.get(role.id)!);
		if (a.lower || a.same) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.higher`));
		await msg.member.addRole(role.id, encodeURIComponent(`iam command: ${msg.author.tag} (${msg.author.id})`));

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.given`, [role.name]));
	});
