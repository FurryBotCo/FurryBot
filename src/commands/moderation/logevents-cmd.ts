import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"logevents"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Enable or disable logging.",
	usage: "[enable/disable] [event] [channel]",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const a = ["enable", "disable"];
	const b = Object.keys(config.defaults.guildConfig.logEvents).map(e => e.toLowerCase());
	if (msg.args.length >= 2) {
		if (!a.includes(msg.args[0].toLowerCase())) return msg.reply(`invalid option, valid options: **${a.join("**, **")}**.`);
		if (!b.includes(msg.args[1].toLowerCase())) return msg.reply(`invalid option, valid options: **${b.join("**, **")}**.`);
		const c = msg.args[0].toLowerCase() === "disable" ? false : true;
		let ch = await msg.getChannelFromArgs(2);
		if (!ch) ch = msg.channel;

		const ev = Object.keys(config.defaults.guildConfig.logEvents)[Object.keys(config.defaults.guildConfig.logEvents).map(k => k.toLowerCase()).indexOf(msg.args[1].toLowerCase())];
		await msg.gConfig.edit({
			logEvents: {
				[ev]: {
					channel: ch.id,
					enabled: c
				}
			}
		}).then(d => d.reload());
		if (c) return msg.reply(`enabled the logging of **${ev}** in channel <#${ch.id}>.`);
		else return msg.reply(`disabled the logging of **${ev}**.`);
	} else if (msg.args.length === 0) {
		const d = [];
		await Promise.all(Object.keys(config.defaults.guildConfig.logEvents).map(async (k) => {
			const j = msg.gConfig.logEvents[k];
			if (!j || !j.enabled) return d.push(`${k} - **disabled**`);
			const ch = msg.channel.guild.channels.get(j.channel);
			if (!ch) await msg.gConfig.edit({
				logEvents: {
					[k]: {
						channel: null,
						enabled: false
					}
				}
			}).then(d => d.reload());
			return d.push(`${k} - <#${j.channel}>`);
		}));

		const embed: Eris.EmbedOptions = {
			title: "Log Events",
			description: d.join("\n"),
			timestamp: new Date().toISOString(),
			author: {
				name: msg.channel.guild.name,
				icon_url: msg.channel.guild.iconURL
			}
		};

		return msg.channel.createMessage({ embed });
	} else return new Error("ERR_INVALID_USAGE");
}));
