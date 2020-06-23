import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import { Time, Internal } from "../../util/Functions";
import { Stats } from "eris-fleet";

export default new Command({
	triggers: [
		"stats"
	],
	permissions: {
		user: [],
		bot: [
			"attachFiles"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const stats = await Internal.getStats();
	const st: Stats = await this.ipc.getStats();
	if (!st) return msg.reply("{lang:other.errors.noStats}");

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.stats.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setThumbnail(config.images.botIcon)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.addField("{lang:commands.information.stats.commandsTotal}", `${stats.commandsTotal || "{lang:other.words.noneYet}"} / ${stats.commandsAllTime || "{lang:other.words.noneYet}"}`, true)
			.addField("{lang:commands.information.stats.messages}", `${stats.messages || "{lang:other.words.noneYet}"} / ${stats.messagesAllTime || "{lang:other.words.noneYet}"}`, true)
			.addField("{lang:commands.information.stats.directMessage}", `${stats.directMessage || "{lang:other.words.noneYet}"}`, true)
			.addField("{lang:commands.information.stats.guildCount}", st.clusters.reduce((a, b) => b.guilds + a, 0).toString(), true)
			.addField("{lang:commands.information.stats.largeGuildCount}", st.clusters.reduce((a, b) => b.largeGuilds + a, 0).toString(), true)
			.addField("{lang:commands.information.stats.userCount}", st.clusters.reduce((a, b) => b.users + a, 0).toString(), true)
			.addField("{lang:commands.information.stats.shardCount}", st.clusters.reduce((a, b) => b.shardStats.length + a, 0).toString(), true)
			.addField("{lang:commands.information.stats.uptime}", `${Time.ms(process.uptime() * 1000)} / ${Time.ms(stats.uptime || 0)}`, true)
			.addField("{lang:commands.information.stats.memoryUsage}", [
				"**{lang:commands.information.stats.memoryUsageTotal}**",
				`${Math.floor(st.totalRam)} MB`,
				"",
				"**{lang:commands.information.stats.memoryUsageMaster}**",
				`${Math.floor(st.masterRam)} MB`,
				"",
				"**{lang:commands.information.stats.memoryUsageClusters}**",
				...st.clusters.map((c, i) => `**#${i}** - ${Math.floor(c.ram)} MB`),
				"",
				"**{lang:commands.information.stats.memoryUsageServices}**",
				...st.services.map(s => `**${s.name}** - ${Math.floor(s.ram)} MB`)
			].join("\n"), false)
			.toJSON()
	});
}));
