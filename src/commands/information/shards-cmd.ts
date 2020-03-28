import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"shards"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setTitle("{lang:commands.information.shards.title}")
		.setFooter(`{lang:commands.information.shards.footer|${msg.channel.guild.shard.id}|${this.guilds.size}|${Math.floor(this.shards.map(s => s.latency).reduce((a, b) => a + b) / this.shards.size)}}`)
		.setColor(Colors.gold)
		.setTimestamp(new Date().toISOString());


	this.shards.map(s =>
		embed.addField(`{lang:commands.information.shards.shard|${s.id}}`, `{lang:commands.information.shards.guilds}: ${this.guilds.filter(g => g.shard.id === s.id).length}\n{lang:commands.information.shards.ping}: ${s.latency !== Infinity ? `${s.latency}ms` : "N/A"}\nStatus: ${s.status}`, true)
	);

	return msg.channel.createMessage({
		embed
	});
}));
