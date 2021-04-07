import GuildConfig, { DBKeys } from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Colors, Command, CommandError, EmbedBuilder } from "core";
import Language from "language";
import chunk from "chunk";

export default new Command<FurryBot, UserConfig, GuildConfig>(["levelroles"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageRoles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) throw new CommandError("INVALID_USAGE", cmd);

		switch (msg.args[0]?.toLowerCase()) {
			case "list": {
				if (msg.gConfig.levelRoles.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.noRoles`));
				const pages = chunk(msg.gConfig.levelRoles, 10);
				const page = Number(msg.args[2] || 1);
				if (isNaN(page) || page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage`, [msg.args[2], pages.length]));

				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.list.title}`)
						.setFooter(`Page ${page}/${pages.length}`, this.bot.user.avatarURL)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setColor(Colors.furry)
						.setDescription(pages[page - 1].map((v, i) => `(#${(i + 1) + ((page - 1) * 10)}) {lang:${cmd.lang}.list.lvl|${v.level}}: <@&${v.role}>`).join("\n"))
						.toJSON()
				});
				break;
			}

			case "remove": {
				if (!msg.member.permissions.has("manageRoles")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingPerm`, ["manageRoles"]));
				if (msg.args.length < 2) return new CommandError("INVALID_USAGE", cmd);
				if (msg.gConfig.levelRoles.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.noRoles`));
				const n = Number(msg.args[2] || 1);
				const j = msg.gConfig.levelRoles.find((k, i) => (i + 1) === n);
				if (isNaN(n) || n > msg.gConfig.levelRoles.length || !j) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.invalidId`, [msg.args[2], msg.gConfig.levelRoles.length]));
				await msg.gConfig.mongoEdit<DBKeys>({
					$pull: {
						levelRoles: j
					}
				});
				return msg.reply({
					content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.done`, [j.role, j.level]),
					allowedMentions: {
						roles: false
					}
				});
				break;
			}

			case "add": {
				if (!msg.member.permissions.has("manageRoles")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingPerm`, ["manageRoles"]));
				if (msg.gConfig.levelRoles.length >= 25) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.max`));
				if (msg.args.length < 3) return new CommandError("INVALID_USAGE", cmd);
				const role = await msg.getRoleFromArgs(1, true, 0);
				if (!role) return msg.reply({
					embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_ROLE", true)
				});
				const v = msg.gConfig.levelRoles.find(r => r.role === role.id);
				if (v) return msg.reply({
					content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.alreadyAdded`, [v.role, v.level]),
					allowedMentions: {
						roles: false
					}
				});
				const lvl = Number(msg.args[2]);
				if (!lvl || lvl < 0 || Math.floor(lvl) !== lvl || lvl > 5000) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidLevel`));
				await msg.gConfig.mongoEdit({
					$push: {
						levelRoles: {
							role: role.id,
							level: lvl
						}
					}
				});
				return msg.reply({
					content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.done`, [role.id, lvl]),
					allowedMentions: {
						roles: false
					}
				});
				break;
			}

			default: throw new CommandError("INVALID_USAGE", cmd);
		}

	})
	.setOverride("invalidUsage", async function (msg, cmd) {
		if (msg.args.length === 0 || !["list", "remove", "add"].includes(msg.args[0]?.toLowerCase())) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.bot.user.avatarURL)
				.setColor(Colors.red)
				.setDescription([
					`{lang:${cmd.lang}.help.subNotice}`,
					`\\* - {lang:${cmd.lang}.help.requiresPerm1|manageRoles}`,
					"",
					`{lang:${cmd.lang}.help.example|${msg.prefix}}`,
					"",
					`\`list\` - {lang:${cmd.lang}.help.listDesc}`,
					`(\\*) \`remove\` - {lang:${cmd.lang}.help.removeDesc}`,
					`(\\*) \`add\` - {lang:${cmd.lang}.help.addDesc}`
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.toJSON()
		}).then(() => undefined);

		switch (msg.args[0]?.toLowerCase()) {
			case "list": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.list$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("OwO", this.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.noPerms}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}levelroles list [page]\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			}).then(() => undefined);

			case "remove": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.remove$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("OwO", this.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.requiresPerm2|manageRoles}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}levelroles remove <id>\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			}).then(() => undefined);

			case "add": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.add$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("OwO", this.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.requiresPerm2|manageRoles}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}levelroles add @role <lvl>\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			}).then(() => undefined);

			default: throw new TypeError("We shouldn't be here. Please report this. (w/d)");
		}
	});
