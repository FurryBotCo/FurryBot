import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"shards"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get some info about my shards.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const embed: Eris.EmbedOptions = {
		title: "Shard Info",
		fields: this.shards.map(s => ({
			name: `Shard #${s.id}`,
			value: `Guilds: ${this.guilds.filter(g => g.shard.id === s.id).length}\nPing: ${s.latency !== Infinity ? `${s.latency}ms` : "N/A"}\nStatus: ${s.status}`,
			inline: true
		})),
		color: Colors.gold,
		timestamp: new Date().toISOString(),
		footer: {
			text: `Current Shard: #${msg.channel.guild.shard.id} | Total Guilds: ${this.guilds.size}`
		}
	};

	// if (this.shards.map(s => s.id).includes(msg.channel.guild.shard.id)) embed.fields.find(f => f.name === `Shard #${msg.guild.shard.id}`).name = `Shard #${msg.guild.shard.id} (current)`;

	return msg.channel.createMessage({
		embed
	});
}));
