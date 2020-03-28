import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"log"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const a = ["enable", "disable"];
	const b = [...Object.keys(config.defaults.config.guild.logEvents).map(e => e.toLowerCase()), "all"];
	if (msg.args.length >= 2) {
		if (!a.includes(msg.args[0].toLowerCase())) return msg.reply(`{lang:commands.moderation.log.invalidOption}: **${a.join("**, **")}**.`);
		if (!b.includes(msg.args[1].toLowerCase())) return msg.reply(`{lang:commands.moderation.log.invalidOption}: **${b.join("**, **")}**.`);
		const c = msg.args[0].toLowerCase() === "disable" ? false : true;
		let ch = await msg.getChannelFromArgs(2);
		if (!ch) ch = msg.channel;
		if (ch.guild.id !== msg.channel.guild.id) return msg.reply("{lang:commands.moderation.log.thisServer}");

		if (msg.args[1].toLowerCase() === "all") {
			await gConfig.edit({
				logEvents: Object.keys(config.defaults.config.guild.logEvents)
					.map(e => ({
						[e]: {
							channel: ch.id,
							enabled: c
						}
					})).reduce((a, b) => ({ ...a, ...b }), {})
			}).then(d => d.reload());

			if (c) return msg.reply(`{lang:commands.moderation.log.enabledAll|${ch.id}}`);
			else return msg.reply(`{lang:commands.moderation.log.disableAll}`);
		} else {
			const ev = Object.keys(config.defaults.config.guild.logEvents)[Object.keys(config.defaults.config.guild.logEvents).map(k => k.toLowerCase()).indexOf(msg.args[1].toLowerCase())];

			await gConfig.edit({
				logEvents: {
					[ev]: {
						channel: ch.id,
						enabled: c
					}
				}
			}).then(d => d.reload());

			if (c) return msg.reply(`{lang:commands.moderation.log.eventEnabled|${ev}|${ch.id}}`);
			else return msg.reply(`{lang:commands.moderation.log.eventDisabled|${ev}}`);
		}
	} else if (msg.args.length === 0) {
		const d = [];
		await Promise.all(Object.keys(config.defaults.config.guild.logEvents).map(async (k) => {
			const j = gConfig.logEvents[k];
			if (!j || !j.enabled) return d.push(`${k} - **{lang:commands.moderation.log.disabled}**`);
			const ch = msg.channel.guild.channels.get(j.channel);
			if (!ch) await gConfig.edit({
				logEvents: {
					[k]: {
						channel: null,
						enabled: false
					}
				}
			}).then(d => d.reload());
			return d.push(`${k} - <#${j.channel}>`);
		}));

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.log.title}")
				.setDescription(d.join("\n"))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
		});
	} else return new Error("ERR_INVALID_USAGE");
}));
