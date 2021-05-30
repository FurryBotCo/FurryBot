import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot, { VALID_LANGUAGES } from "../../main";
import config from "../../config";
import { Colors, Command, EmbedBuilder, BotFunctions } from "core";
import { Internal } from "utilities";
import Language from "language";
import chunk from "chunk";
import Eris from "eris";

// yes, I KNOW this is a mess, but I do not have
// the time to rewrite this command from scratch
export default new Command<FurryBot, UserConfig, GuildConfig>(["settings"], __filename)
	.setBotPermissions([
		"embedLinks",
		"externalEmojis"
	])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const str = config.settings.map(s => ({ [s.name.toLowerCase()]: s.dbName })).reduce((a, b) => ({ ...a, ...b }));

		const booleanChoices = {
			enabled: true,
			enable: true,
			e: true,
			true: true,
			disabled: false,
			disable: false,
			d: false,
			false: false
		} as const;

		if (msg.args.length === 0 || !isNaN(Number(msg.args[0]))) {
			const page = msg.args.length < 1 ? 1 : Number(msg.args[0]);
			const pages = chunk(config.settings, 5).map(s => s.map(ss => ({ ...ss, value: msg.gConfig.settings[ss.dbName as keyof GuildConfig["settings"]] })));
			if (page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`));

			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription([
						...pages[page - 1].map(s => {
							let v = "";

							switch (s.type) {
								case "boolean": {
									v = `<:${config.emojis.custom[s.value ? "greenTick" : "redTick"]}>`;
									break;
								}

								case "channel": {
									v = !s.value ? "{lang:other.words.none}" : `<#${String(s.value)}>`;
									break;
								}

								case "role": {
									v = !s.value ? "{lang:other.words.none}" : `<@&${String(s.value)}>`;
									break;
								}

								/* case "array": {
									switch (s.subType) {
										case "channel": {
											v = !s.value || s.value.length === 0 ? "{lang:other.words.none}" : s.value.map(v => `<#${v}>`).join(", ");
											break;
										}

										case "role": {
											v = !s.value || s.value.length === 0 ? "{lang:other.words.none}" : s.value.map(v => `<@&${v}>`).join(", ");
											break;
										}

										case "user": {
											v = !s.value || s.value.length === 0 ? "{lang:other.words.none}" : s.value.map(v => `<@!${v}>`).join(", ");
											break;
										}
									}
									break;
								} */

								default: {
									v = Internal.sanitize(s.value ? s.value.toString() : `{lang:${cmd.lang}.noValue}`);
								}
							}

							return [
								`**${s.name}**`,
								`{lang:${cmd.lang}.value}: **${v}**`,
								s.description
							].join("\n");
						})
					].join("\n\n"))
					.setFooter(`{lang:${cmd.lang}.footer|${page}|${pages.length}|${msg.prefix}}`, this.bot.user.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.furry)
					.toJSON()
			});
		}

		let v: string | undefined, n: string, s:  keyof GuildConfig["settings"] | undefined;
		const j = [...msg.args];

		for (let i = 0; i <= j.length; i++) {
			const k = j.slice(0, i).join(" ").toLowerCase();
			if (Object.keys(str).includes(k)) {
				v = j.slice(i, j.length).join(" ");
				n = k;
				s = str[k] as keyof GuildConfig["settings"];
				break;
			} else continue;
		}

		if (!s) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound`));
		let cur: string | boolean | undefined | null = msg.gConfig.settings[s];
		const setting = config.settings.find(st => st.dbName === s)!;

		switch (setting.type) {
			case "channel": {
				if (!v) {
					if (cur && !msg.channel.guild.channels.has(String(cur))) {
						await msg.gConfig.edit({
							settings: {
								[s]: null
							}
						});
						cur = null;
					}
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, cur ? `<#${String(cur)}>` : Language.get(msg.gConfig.settings.lang, "other.words.none").toUpperCase()]));
				}
				let ci: string | undefined;
				const a = /^([0-9]{15,21})$/.exec(v);
				const b = /^<#([0-9]{15,21})>$/.exec(v);
				const c = msg.channel.guild.channels.find(ch => ch.name.toLowerCase() === v!.toLowerCase());

				if (a && a.length > 0) ci = a[0];
				if (b && b.length > 1) ci = b[1];
				if (c) ci = c.id;

				if (ci === msg.gConfig.settings[s]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));

				const ch = msg.channel.guild.channels.get(ci!);
				if (!ch) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.chNotFound`));
				if (!ch.permissionsOf(this.bot.user.id).has("sendMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.chPermMissing`, [ch.id]));

				await msg.gConfig.edit({
					settings: {
						[s]: ch.id
					}
				});

				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [n!, cur === null ? Language.get(msg.gConfig.settings.lang, "other.words.none").toUpperCase() : `<#${String(cur)}>`, `<#${ch.id}>`]));
				break;
			}

			case "role": {
				if (!v) {
					if (cur && !msg.channel.guild.roles.has(String(cur))) {
						await msg.gConfig.edit({
							settings: {
								[s]: null
							}
						});
						cur = null;
					}

					let k: Eris.Role | undefined;
					if (cur) k = msg.channel.guild.roles.get(String(cur));
					return msg.reply({
						content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, cur ? `<@&${k!.id}>` : Language.get(msg.gConfig.settings.lang, "other.words.none").toUpperCase()]),
						allowedMentions: {
							roles: []
						}
					});
				}
				let ri: string | undefined;
				const a = /^([0-9]{15,21})$/.exec(v);
				const b = /^<@&([0-9]{15,21})>$/.exec(v);
				const c = msg.channel.guild.roles.find(r => r.name.toLowerCase() === v!.toLowerCase());

				if (a && a.length > 0) ri = a[0];
				if (b && b.length > 1) ri = b[1];
				if (c) ri = c.id;

				const r = msg.channel.guild.roles.get(String(ri));
				if (!r) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.roleNotFound`));
				if (r.id === msg.gConfig.settings[s]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));
				const p = BotFunctions.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id)!, r);

				if (p.lower || p.same) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.roleHigher`));

				await msg.gConfig.edit({
					settings: {
						[s]: r.id
					}
				});

				await msg.reply({
					content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [n!, cur === null ? Language.get(msg.gConfig.settings.lang, "other.words.none").toUpperCase() : `<@&${String(cur)}>`, `<@&${r.id}>`]),
					allowedMentions: {
						roles: []
					}
				});

				if (s === "muteRole") await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.muteNotice`, [msg.prefix]));

				return;
				break;
			}

			case "boolean": {
				if (!v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, cur ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.enabled`) : Language.get(msg.gConfig.settings.lang, `${cmd.lang}.disabled`)]));

				if (!Object.keys(booleanChoices).includes(v.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidValue`));

				const k = booleanChoices[v.toLowerCase() as keyof typeof booleanChoices];

				if (msg.gConfig.settings[s] === k) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));

				await msg.gConfig.edit({
					settings: {
						[s]: k
					}
				});

				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [n!, cur ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.enabled`) : Language.get(msg.gConfig.settings.lang, `${cmd.lang}.disabled`), k ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.enabled`) : Language.get(msg.gConfig.settings.lang, `${cmd.lang}.disabled`)]));
				break;
			}

			case "string": {
				if (!v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, Internal.sanitize(String(cur)) || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`)]));

				if (msg.gConfig.settings[s] === v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));

				await msg.gConfig.edit({
					settings: {
						[s]: v
					}
				});

				return msg.reply(Language.get(msg.gConfig.settings.lang, `{${cmd.lang}.set`, [n!, Internal.sanitize(String(cur)) || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`), Internal.sanitize(v)]));
				break;
			}

			case "number": {
				if (!v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, !cur ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`) : String(cur)])!);
				const num = Number(v);
				if (isNaN(num)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidNumber`));

				if (Number(msg.gConfig.settings[s]) === num) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));

				await msg.gConfig.edit({
					settings: {
						[s]: v
					}
				});

				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [n!, !cur ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`) : String(cur), v])!);
				break;
			}

			case "custom": {
				switch (s) {
					case "lang": {
						if (!v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, Internal.sanitize(String(cur)) || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`)]));

						if (msg.gConfig.settings[s] === v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));

						if (!config.languages.includes(v as VALID_LANGUAGES)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidLang`, [v, config.languages.map(l => `**${l}**`).join(", ")]));
						await msg.gConfig.edit({
							settings: {
								[s]: v as VALID_LANGUAGES
							}
						});

						return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [n!, Internal.sanitize(String(cur)) || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`), Internal.sanitize(v)]));
						break;
					}

					case "defaultYiffType": {
						if (!v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [n!, Internal.sanitize(String(cur)) || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`)]));

						if (msg.gConfig.settings[s] === v) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`));

						if (!config.yiffTypes.includes(v)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidYiffType`, [v, config.yiffTypes.map(y => `**${y}**`).join(", ")]));
						await msg.gConfig.edit({
							settings: {
								[s]: v
							}
						});

						return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [n!, Internal.sanitize(String(cur)) || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noValue`), Internal.sanitize(v)]));
						break;
					}
				}
				break;
			}
		}
	});
