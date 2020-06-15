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

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.stats.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setThumbnail(config.images.botIcon)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.addField("{lang:commands.information.stats.commandsTotal}", `${stats.commandsTotal || "{lang:other.words.noneYet}"} / ${stats.commandsAllTime || "{lang:other.words.noneYet}"}`, true)
			.addField("{lang:commands.information.stats.messages}", `${stats.messages || "{lang:other.words.noneYet}"} / ${stats.messageCreate || "{lang:other.words.noneYet}"}`, true)
			.addField("{lang:commands.information.stats.directMessage}", `${stats.directMessage || "{lang:other.words.noneYet}"}`, true)
			.addField("{lang:commands.information.stats.guildCount}", this.bot.guilds.size.toString(), true)
			.addField("{lang:commands.information.stats.largeGuildCount}", this.bot.guilds.filter(g => g.large).length.toString(), true)
			.addField("{lang:commands.information.stats.userCount}", this.bot.users.size.toString(), true)
			.addField("{lang:commands.information.stats.channelCount}", Object.keys(this.bot.channelGuildMap).length.toString(), true)
			.addField("{lang:commands.information.stats.shardCount}", this.bot.shards.size.toString(), true)
			.addField("{lang:commands.information.stats.uptime}", `${Time.ms(process.uptime() * 1000)} / ${Time.ms(stats.uptime || 0)}`, true)
			.toJSON()
	});
}));
