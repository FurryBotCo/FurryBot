import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import Eris from "eris";
import chunk from "chunk";
import config from "../../config";
import { Colors } from "../../util/Constants";
import { Utility } from "../../util/Functions";

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
	description: "Edit this servers settings.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
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
		const pages = chunk(config.settings, 4).map(s => s.map(ss => ({ ...ss, value: msg.gConfig.settings[ss.dbName] })));
		if (page > pages.length) return msg.reply("invalid settings page.");

		return msg.channel.createMessage({
			embed: {
				title: "Server Settings",
				description: [
					...pages[page - 1].map(s => [
						`**${s.name}** - ${s.type === "boolean" ? !!s.value ? `<:${config.emojis.greenTick}>` : `<:${config.emojis.redTick}>` : s.type === "channel" ? !s.value ? "NONE" : `<#${s.value}>` : s.type === "role" ? !s.value ? "NONE" : `<@&${s.value}>` : `**${s.value}**`}`,
						s.description
					].join("\n"))
				].join("\n\n"),
				footer: {
					text: `Page ${page}/${pages.length}`
				},
				timestamp: new Date().toISOString(),
				color: Colors.gold
			}
		});
	}

	let v: string, n: string, s: string;
	const j = [...msg.args];

	for (let i = 0; i <= j.length; i++) {
		const k = j.slice(0, i).join(" ");
		if (Object.keys(str).includes(k.toLowerCase())) {
			v = j.slice(i, j.length).join(" ");
			n = k;
			s = str[k];
			break;
		} else continue;
	}

	if (!s) return msg.reply("could not find that setting.");
	let cur = msg.gConfig.settings[s];

	switch (config.settings.find(st => st.dbName === s).type) {
		case "channel": {
			if (!v) {
				if (cur && !msg.channel.guild.channels.has(cur)) {
					await msg.gConfig.edit({
						settings: {
							[s]: null
						}
					});
					cur = null;
				}
				return msg.reply(`**${n}** is currently set to ${cur ? `<#${cur}>` : "None"}`);
			}
			let ci: string;
			const a = v.match("^([0-9]{17,19})$");
			const b = v.match("^<#([0-9]{17,19})>$");
			const c = msg.channel.guild.channels.find(ch => ch.name.toLowerCase() === v.toLowerCase());

			if (a && a.length > 0) ci = a[0];
			if (b && b.length > 1) ci = b[1];
			if (c) ci = c.id;

			if (c.id === msg.gConfig.settings[s]) return msg.reply("unchanged.");

			const ch = msg.channel.guild.channels.get(ci);
			if (!ch) return msg.reply("I couldn't find that channel..");
			if (!ch.permissionsOf(this.user.id).has("sendMessages")) return msg.reply(`I don't seem to be able to send messages in <#${ch.id}>..`);

			await msg.gConfig.edit({
				settings: {
					[s]: ch.id
				}
			});

			return msg.reply(`changed **${n}** from <#${cur}> to <#${ch.id}>.`);
			break;
		}

		case "role": {
			if (!v) {
				if (cur && !msg.channel.guild.roles.has(cur)) {
					await msg.gConfig.edit({
						settings: {
							[s]: null
						}
					});
					cur = null;
				}

				let k: Eris.Role;
				if (cur) k = msg.channel.guild.roles.get(cur);
				return msg.reply(`**${n}** is currently set to ${cur ? k.name : "None"}`);
			}
			let ri: string;
			const a = v.match("^([0-9]{17,19})$");
			const b = v.match("^<@&([0-9]{17,19})>$");
			const c = msg.channel.guild.roles.find(r => r.name.toLowerCase() === v.toLowerCase());

			if (a && a.length > 0) ri = a[0];
			if (b && b.length > 1) ri = b[1];
			if (c) ri = c.id;

			const r = msg.channel.guild.roles.get(ri);
			if (!r) return msg.reply("I couldn't find that role..");
			if (r.id === msg.gConfig.settings[s]) return msg.reply("unchanged.");
			const p = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), r);

			if (p.lower || p.same) return msg.reply("that role is higher than, or as high as my top role. Therefore, I cannot touch it, please move it below me, or move me above it.");

			await msg.gConfig.edit({
				settings: {
					[s]: r.id
				}
			});

			return msg.reply(`changed **${n}** to ${r.name}.`);
			break;
		}

		case "boolean": {
			if (!v) return msg.reply(`**${n}** is currently set to ${cur ? "Enabled" : "Disabled"}.`);

			if (!Object.keys(booleanChoices).includes(v.toLowerCase())) return msg.reply("invalid value.");

			const k = booleanChoices[v.toLowerCase()];

			if (msg.gConfig.settings[s] === k) return msg.reply("unchanged.");

			await msg.gConfig.edit({
				settings: {
					[s]: k
				}
			});

			return msg.reply(`changed **${n}** from ${cur ? "Enabled" : "Disabled"} to ${k ? "Enabled" : "Disabled"}.`);
			break;
		}

		case "string": {
			if (!v) return msg.reply(`**${n}** is currently set to ${cur || "No Value"}`);

			if (msg.gConfig.settings[s] === v) return msg.reply("unchanged.");

			await msg.gConfig.edit({
				settings: {
					[s]: v
				}
			});

			return msg.reply(`changed **${n}** from ${cur || "No Value"} to ${v} .`);
			break;
		}
	}
	/*const c = msg.args[0].toLowerCase();
	const s = Object.values(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
	const set = Object.keys(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
	if (!Object.keys(settings).map(s => s.toLowerCase()).includes(c)) return msg.reply(`Invalid setting. You can use \`${msg.gConfig.settings.prefix}settings list\` to list settings.`);
	if (msg.args.length === 1) return msg.reply(`The setting ${set} is currently set to ${msg.gConfig.settings[set] || "NONE"}.`);
	else {
		switch (s) {
			case "role": {
				const r = await msg.getRoleFromArgs(1);
				const o = msg.gConfig.settings[set];
				if (!r) return msg.errorEmbed("INVALID_ROLE");

				await msg.gConfig.edit({ settings: { [set]: r.id } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: r.id, timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o}" to "${r.id}".`);
				break;
			}

			case "channel": {
				let ch: Eris.GuildTextableChannel, o;
				if (msg.args[1].toLowerCase() !== "reset") {
					ch = await msg.getChannelFromArgs(1);
					o = msg.gConfig.settings[set];
					if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
				}

				await msg.gConfig.edit({ settings: { [set]: ch ? ch.id : null } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: r.id, timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o ? `<#${o}>` : "NONE"}" to "${ch ? `<#${ch.id}>` : "NONE"}".`);
				break;
			}

			case "boolean": {
				if (!Object.keys(booleanChoices).includes(msg.args[1].toLowerCase())) return msg.reply(`Invalid choice, must be one of "enabled", "disabled".`);
				const o = msg.gConfig.settings[set];
				await msg.gConfig.edit({ settings: { [set]: booleanChoices[msg.args[1].toLowerCase()] } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: booleanChoices[msg.args[1].toLowerCase()], timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o ? "enabled" : "disabled"} to "${booleanChoices[msg.args[1].toLowerCase()] ? "enabled" : "disabled"}".`);
				break;
			}

			case "string": {
				const o = msg.gConfig.settings[set];
				await msg.gConfig.edit({ settings: { [set]: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ") } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" "), timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o}" to "${msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ")}"`);
				break;
			}
		}
	}*/
}));
