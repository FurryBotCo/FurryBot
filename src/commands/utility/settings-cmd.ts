import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import Eris from "eris";
import chunk from "chunk";
import config from "../../config";
import { Colors } from "../../util/Constants";
import { Utility, Internal } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"settings"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 1e3,
	donatorCooldown: 1e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
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
	};

	if (msg.args.length === 0 || !isNaN(Number(msg.args[0]))) {
		const page = msg.args.length < 1 ? 1 : Number(msg.args[0]);
		const pages = chunk(config.settings, 5).map(s => s.map(ss => ({ ...ss, value: gConfig.settings[ss.dbName] })));
		if (page > pages.length) return msg.reply("{lang:commands.utility.settings.invalidPage}");

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.utility.settings.title}")
				.setDescription([
					...pages[page - 1].map(s => [
						`**${s.name}**`,
						`{lang:commands.utility.settings.value}: ${s.type === "boolean" ? !!s.value ? `<:${config.emojis.greenTick}>` : `<:${config.emojis.redTick}>` : s.type === "channel" ? !s.value ? "{lang:commands.utility.settings.none}" : `<#${s.value}>` : s.type === "role" ? !s.value ? "{lang:commands.utility.settings.none}" : `<@&${s.value}>` : `**${Internal.sanitize(![undefined, null].includes(s.value) ? s.value.toString() : "{lang:commands.utility.settings.noValue}")}**`}`,
						s.description
					].join("\n"))
				].join("\n\n"))
				.setFooter(`{lang:commands.utility.settings.footer|${page}|${pages.length}|${gConfig.settings.prefix}}`)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
		});
	}

	let v: string, n: string, s: string;
	const j = [...msg.args];

	for (let i = 0; i <= j.length; i++) {
		const k = j.slice(0, i).join(" ").toLowerCase();
		if (Object.keys(str).includes(k)) {
			v = j.slice(i, j.length).join(" ");
			n = k;
			s = str[k];
			break;
		} else continue;
	}

	if (!s) return msg.reply("{lang:commands.utility.settings.notFound}");
	let cur = gConfig.settings[s];

	switch (config.settings.find(st => st.dbName === s).type) {
		case "channel": {
			if (!v) {
				if (cur && !msg.channel.guild.channels.has(cur)) {
					await gConfig.edit({
						settings: {
							[s]: null
						}
					});
					cur = null;
				}
				return msg.reply(`{lang:commands.utility.settings.current|${n}|${cur ? `<#${cur}>` : "{lang:commands.utility.settings.none}"}`);
			}
			let ci: string;
			const a = v.match("^([0-9]{17,19})$");
			const b = v.match("^<#([0-9]{17,19})>$");
			const c = msg.channel.guild.channels.find(ch => ch.name.toLowerCase() === v.toLowerCase());

			if (a && a.length > 0) ci = a[0];
			if (b && b.length > 1) ci = b[1];
			if (c) ci = c.id;

			if (ci === gConfig.settings[s]) return msg.reply("{lang:commands.utility.settings.unchanged}");

			const ch = msg.channel.guild.channels.get(ci);
			if (!ch) return msg.reply("{lang:commands.utility.settings.chNotFound}");
			if (!ch.permissionsOf(this.user.id).has("sendMessages")) return msg.reply(`{lang:commands.utility.settings.chPermMissing|${ch.id}}`);

			await gConfig.edit({
				settings: {
					[s]: ch.id
				}
			});

			return msg.reply(`{lang:commands.utility.settings.set${n}|${cur === null ? "{lang:commands.utility.settings.none}" : `<#${cur}>`}|<#${ch.id}}`);
			break;
		}

		case "role": {
			if (!v) {
				if (cur && !msg.channel.guild.roles.has(cur)) {
					await gConfig.edit({
						settings: {
							[s]: null
						}
					});
					cur = null;
				}

				let k: Eris.Role;
				if (cur) k = msg.channel.guild.roles.get(cur);
				return msg.reply(`{lang:commands.utility.settings.current|${n}|${cur ? k.name : "{lang:commands.utility.settings.none}"}}`);
			}
			let ri: string;
			const a = v.match("^([0-9]{17,19})$");
			const b = v.match("^<@&([0-9]{17,19})>$");
			const c = msg.channel.guild.roles.find(r => r.name.toLowerCase() === v.toLowerCase());

			if (a && a.length > 0) ri = a[0];
			if (b && b.length > 1) ri = b[1];
			if (c) ri = c.id;

			const r = msg.channel.guild.roles.get(ri);
			if (!r) return msg.reply("{lang:commands.utility.settings.roleNotFound}");
			if (r.id === gConfig.settings[s]) return msg.reply("{lang:commands.utility.settings.unchanged}");
			const p = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), r);

			if (p.lower || p.same) return msg.reply("{lang:commands.utility.settings.roleHigher}");

			await gConfig.edit({
				settings: {
					[s]: r.id
				}
			});

			return msg.reply(`{lang:commands.utility.settings.set|${n}|${r.name}}`);
			break;
		}

		case "boolean": {
			if (!v) return msg.reply(`{lang:commands.utility.settings.current|${n}|${cur ? Language.parseString(gConfig.settings.lang, "{lang:commands.utility.settings.enabled}") : Language.parseString(gConfig.settings.lang, "{lang:commands.utility.settings.disabled}")}}`);

			if (!Object.keys(booleanChoices).includes(v.toLowerCase())) return msg.reply("{lang:commands.utility.settings.invalidValue}");

			const k = booleanChoices[v.toLowerCase()];

			if (gConfig.settings[s] === k) return msg.reply("{lang:commands.utility.settings.unchanged}");

			await gConfig.edit({
				settings: {
					[s]: k
				}
			});

			return msg.reply(`{lang:commands.utility.settings.set|${n}|${cur ? Language.parseString(gConfig.settings.lang, "{lang:commands.utility.settings.enabled}") : Language.parseString(gConfig.settings.lang, "{lang:commands.utility.settings.disabled}")}|${k ? Language.parseString(gConfig.settings.lang, "{lang:commands.utility.settings.enabled}") : Language.parseString(gConfig.settings.lang, "{lang:commands.utility.settings.disabled}")}}`);
			break;
		}

		case "string": {
			if (!v) return msg.reply(`{lang:commands.utility.settings.current|${n}|${Internal.sanitize(cur) || "{lang:commands.utility.settings.noValue}"}}`);

			if (gConfig.settings[s] === v) return msg.reply("{lang:commands.utility.settings.unchanged}");

			await gConfig.edit({
				settings: {
					[s]: v
				}
			});

			return msg.reply(`{lang:commands.utility.settings.set|${n}|${Internal.sanitize(cur) || "{lang:commands.utility.settings.noValue}"}|${Internal.sanitize(v)}}`);
			break;
		}

		case "number": {
			if (!v) return msg.reply(`{lang:commands.utility.settings.current|${n}|${[undefined, null].includes(cur) ? "{lang:commands.utility.settings.noValue}" : cur}}`);
			const num = Number(v);
			if (isNaN(num)) return msg.reply("{lang:commands.utility.settings.invalidNumber}");

			if (Number(gConfig.settings[s]) === num) return msg.reply("{lang:commands.utility.settings.unchanged}");

			await gConfig.edit({
				settings: {
					[s]: v
				}
			});

			return msg.reply(`{lang:commands.utility.settings.set|${n}|${[undefined, null].includes(cur) ? "{lang:commands.utility.settings.noValue}" : cur}|${v}}`);
			break;
		}

		case "custom": {
			switch (s) {
				case "lang": {
					if (!v) return msg.reply(`{lang:commands.utility.settings.current|${n}|${Internal.sanitize(cur) || "{lang:commands.utility.settings.noValue}"}}`);

					if (gConfig.settings[s] === v) return msg.reply("{lang:commands.utility.settings.unchanged}");

					if (!config.languages.includes(v)) return msg.reply(`{lang:commands.utility.settings.invalidLang|${v}|${config.languages.join(" ")}}`);
					await gConfig.edit({
						settings: {
							[s]: v
						}
					});

					return msg.reply(`{lang:commands.utility.settings.set|${n}|${Internal.sanitize(cur) || "{lang:commands.utility.settings.noValue}"}|${Internal.sanitize(v)}}`);
					break;
				}
			}
		}
	}
}));
