import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"shard"
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
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.shard.title}")
			.setDescription(`{lang:commands.information.shard.guilds}: ${this.guilds.filter(g => g.shard.id === msg.channel.guild.shard.id).length}\n{lang:commands.information.shard.ping}: ${msg.channel.guild.shard.latency}ms`)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
	});
}));
