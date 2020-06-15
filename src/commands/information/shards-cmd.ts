import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"shards"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.shards.title}")
			.setFooter(`{lang:commands.information.shards.footer|${msg.channel.guild.shard.id}|${this.bot.guilds.size}|${Math.floor(this.bot.shards.map(s => s.latency).reduce((a, b) => a + b) / this.bot.shards.size)}}`)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.addFields(...this.bot.shards.map(s => ({
				name: `{lang:commands.information.shards.shard|${s.id}}`,
				value: `{lang:commands.information.shards.guilds}: ${this.bot.guilds.filter(g => g.shard.id === s.id).length}\n{lang:commands.information.shards.ping}: ${s.latency !== Infinity ? `${s.latency}ms` : "N/A"}\nStatus: ${s.status}`,
				inline: true
			})))
			.toJSON()
	});
}));
