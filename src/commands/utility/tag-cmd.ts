import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Command,  EmbedBuilder } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["tag"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const tags: Record<string, string> = {};

		for (const t of msg.gConfig.tags) {
			const i = msg.gConfig.tags.indexOf(t);
			if (!msg.gConfig.tags[i] || !msg.gConfig.tags[i].content) await msg.gConfig.mongoEdit({ $pull: { tags: t } });
			else tags[t.name.toLowerCase()] = t.content;
		}
		if (msg.args.length < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidUsage`));

		if (["create", "delete", "edit"].includes(msg.args[0].toLowerCase()) && !msg.channel.permissionsOf(this.bot.user.id).has("sendMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingPerms`));

		if (msg.args[0].toLowerCase() === "list") {
			const pages: Array<Array<string>> = [];
			let i = 0;
			for (const tag of Object.keys(tags)) {
				// const name = Object.keys(tags)[values.indexOf(tag)];
				if (!pages[i]) pages[i] = [];
				const len = pages[i].reduce((a, b) => a + b.length, 0);
				if (len + tag.length >= 1000) (i++, pages[i] = []); // eslint-disable-line @typescript-eslint/no-unused-expressions
				pages[i].push(tag);
			}
			if (pages.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noTags`));
			const page = msg.args.length >= 2 ? Number(msg.args[1]) : 1;
			if (page < 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageLess`));
			if (page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`, [pages.length]));

			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.page|${page}|${pages.length}}`)
					.setDescription(`\`${pages[page - 1].join("` `")}\`${pages.length > page ? `\n\n{lang:${cmd.lang}.next|${msg.prefix}|${page + 1}}` : ""}`)
					.setFooter(`{lang:${cmd.lang}.use|${msg.prefix}}`)
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setTimestamp(new Date().toISOString())
					.toJSON()

			});
		}
		if (msg.args.length === 1 || !["create", "delete", "edit"].includes(msg.args[0].toLowerCase())) {
			if (msg.args[0].toLowerCase() === "create") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.createUsage`, [msg.prefix]));
			if (msg.args[0].toLowerCase() === "delete") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleteUsage`, [msg.prefix]));
			if (msg.args[0].toLowerCase() === "edit") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.editUsage`, [msg.prefix]));
			if (!Object.keys(tags).includes(msg.args[0].toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));

			// so people can't just say anything without blame
			return msg.reply(tags[msg.args[0].toLowerCase()]);
		} else {
			if (!msg.args[1]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.needName`));
			switch (msg.args[0].toLowerCase()) {
				case "create": {
					if (Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyExists`, [msg.args[1].toLowerCase()]));
					const content = msg.args.slice(2).join(" ");
					if (!content || content.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.needContent`));
					await msg.gConfig.mongoEdit({
						$push: {
							tags: {
								creationBlame: msg.author.id,
								creationDate: Date.now(),
								name: msg.args[1].toLowerCase(),
								content
							}
						}
					});

					return msg.channel.createMessage({
						embed: new EmbedBuilder(msg.gConfig.settings.lang)
							.setTitle(`{lang:${cmd.lang}.created}`)
							.addField(`{lang:${cmd.lang}.name}`, msg.args[1].toLowerCase(), false)
							.addField(`{lang:${cmd.lang}.content}`, content, false)
							.setColor(Math.floor(Math.random() * 0xFFFFFF))
							.setTimestamp(new Date().toISOString())
							.toJSON()
					});
					break;
				}

				case "edit": {
					const c = msg.gConfig.tags.find(t => t.name.toLowerCase() === msg.args[1].toLowerCase());
					if (!c) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.doesNotExist`, [msg.args[1].toLowerCase()]));
					const content = msg.args.slice(2).join(" ");
					if (!content || content.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.needContent`));
					await msg.gConfig.mongoEdit({
						$pull: {
							tags: c
						},
						$push: {
							tags: {
								creationBlame: msg.author.id,
								creationDate: Date.now(),
								name: msg.args[1].toLowerCase(),
								content
							}
						}
					});

					return msg.channel.createMessage({
						embed: new EmbedBuilder(msg.gConfig.settings.lang)
							.setTitle(`{lang:${cmd.lang}.edited}`)
							.addField(`{lang:${cmd.lang}.name}`, msg.args[1].toLowerCase(), false)
							.addField(`{lang:${cmd.lang}.oldContent}`, c.content, false)
							.addField(`{lang:${cmd.lang}.newContent}`, content, false)
							.setColor(Math.floor(Math.random() * 0xFFFFFF))
							.setTimestamp(new Date().toISOString())
							.toJSON()
					});
					break;
				}

				case "delete": {
					if (!msg.gConfig.tags.map(t => t.name.toLowerCase()).includes(msg.args[1].toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.doesNotExist`, [msg.args[1].toLowerCase()]));
					await msg.gConfig.mongoEdit({
						$pull: msg.gConfig.tags.find(t => t.name.toLowerCase() === msg.args[1].toLowerCase())!
					});
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.deleted`, [msg.args[1].toLowerCase()]));
					break;
				}
			}
		}
	});
