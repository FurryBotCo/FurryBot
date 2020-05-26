import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";

export default new Command({
	triggers: [
		"log"
	],
	permissions: {
		user: [
			"manageGuild"
		],
		bot: []
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const a = ["enable", "disable"];
	const b = [...config.logEvents.map(e => e.toLowerCase()), "all"];
	if (msg.args.length >= 2) {
		if (!a.includes(msg.args[0].toLowerCase())) return msg.reply(`{lang:commands.moderation.log.invalidOption}: **${a.join("**, **")}**.`);
		if (!b.includes(msg.args[1].toLowerCase())) return msg.reply(`{lang:commands.moderation.log.invalidOption}: **${b.join("**, **")}**.`);
		const c = msg.args[0].toLowerCase() === "disable" ? false : true;
		let ch = await msg.getChannelFromArgs(2);
		if (!ch) ch = msg.channel;
		if (ch.guild.id !== msg.channel.guild.id) return msg.reply("{lang:commands.moderation.log.thisServer}");

		if (msg.args[1].toLowerCase() === "all") {
			await gConfig.edit({
				logEvents: []
			}).then(d => d.reload());

			if (c) await gConfig.edit({
				logEvents: config.logEvents.map(l => ({ channel: ch.id, type: l as any }))
			});

			if (c) return msg.reply(`{lang:commands.moderation.log.enabledAll|${ch.id}}`);
			else return msg.reply(`{lang:commands.moderation.log.disableAll}`);
		} else {
			const ev = config.logEvents[config.logEvents.map(k => k.toLowerCase()).indexOf(msg.args[1].toLowerCase())];
			const f = gConfig.logEvents.find(e => e.type === ev);
			if (!!f) await gConfig.mongoEdit({
				$pull: {
					logEvents: f
				} as any
			}).then(d => gConfig.reload());

			await gConfig.mongoEdit({
				$push: {
					logEvents: {
						channel: ch.id,
						type: ev as any
					}
				}
			}).then(d => gConfig.reload());

			if (c) return msg.reply(`{lang:commands.moderation.log.eventEnabled|${ev}|${ch.id}}`);
			else return msg.reply(`{lang:commands.moderation.log.eventDisabled|${ev}}`);
		}
	} else if (msg.args.length === 0) {
		const d = [];
		await Promise.all(config.logEvents.map(async (k) => {
			const j = gConfig.logEvents.find(e => e.type === k);
			if (!j) return d.push(`${k} - **{lang:commands.moderation.log.disabled}**`);
			const ch = msg.channel.guild.channels.get(j.channel);
			if (!ch) {
				await gConfig.mongoEdit({
					$pull: {
						logEvents: j
					}
				}).then(d => gConfig.reload());
				return d.push(`${k} - **{lang:commands.moderation.log.removed}**`);
			}
			return d.push(`${k} - <#${j.channel}>`);
		}));

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.log.title}")
				.setDescription(d.join("\n"))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});
	} else return new Error("ERR_INVALID_USAGE");
}));
