import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import { Time, Internal } from "../../util/Functions";

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
	const st: Stats = await this.getStats();
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
			.addField("{lang:commands.information.stats.guildCount}", st.guilds.toString(), true)
			.addField("{lang:commands.information.stats.largeGuildCount}", st.largeGuilds.toString(), true)
			.addField("{lang:commands.information.stats.userCount}", st.users.toString(), true)
			.addField("{lang:commands.information.stats.shardCount}", st.shards.length.toString(), true)
			.addField("{lang:commands.information.stats.uptime}", `${Time.ms(process.uptime() * 1000)} / ${Time.ms(stats.uptime || 0)}`, true)
			.addField("{lang:commands.information.stats.memoryUsage}", [
				"**{lang:commands.information.stats.memoryUsageTotal}**",
				`${Math.floor(st.ram.total)} MB`,
				"",
				"**{lang:commands.information.stats.memoryUsageMaster}**",
				`${Math.floor(st.ram.master)} MB`,
				"",
				"**{lang:commands.information.stats.memoryUsageClusters}**",
				...st.clusters.map((c, i) => `**#${i}** - ${Math.floor(c.ram)} MB`),
				"",
				"**{lang:commands.information.stats.memoryUsageServices}**",
				...Object.keys(st.services).map(s => `**${s}** - ${Math.floor(st.services[s])} MB`)
			].join("\n"), false)
			.toJSON()
	});
}));
