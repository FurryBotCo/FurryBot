import Command from "../../modules/CommandHandler/Command";
import { Colors } from "../../util/Constants";
import Eris from "eris";

export default new Command({
	triggers: [
		"dstats"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const types = ["size", "shards", "users", "channels"];
	let embed: Eris.EmbedOptions;
	switch (msg.args[0].toLowerCase()) {
		case "size": {
			embed = {
				title: "Guild Size Stats",
				description: [
					`\u25FD 100+ member guilds: ${this.guilds.filter(g => g.memberCount >= 100).length}`,
					`\u25FD 250+ member guilds: ${this.guilds.filter(g => g.memberCount >= 250).length}`,
					`\u25FD 500+ member guilds: ${this.guilds.filter(g => g.memberCount >= 500).length}`,
					`\u25FD 1000+ member guilds: ${this.guilds.filter(g => g.memberCount >= 1000).length}`,
					`\u25FD 2500+ member guilds: ${this.guilds.filter(g => g.memberCount >= 2500).length}`,
					`\u25FD 5000+ member guilds: ${this.guilds.filter(g => g.memberCount >= 5000).length}`,
					`\u25FD 10000+ member guilds: ${this.guilds.filter(g => g.memberCount >= 10000).length}`,
					`\u25FD 25000+ member guilds: ${this.guilds.filter(g => g.memberCount >= 25000).length}`,
					`\u25FD 50000+ member guilds: ${this.guilds.filter(g => g.memberCount >= 50000).length}`,
					`\u25FD 100000+ member guilds: ${this.guilds.filter(g => g.memberCount >= 100000).length}`
				].join("\n"),
				timestamp: new Date().toISOString(),
				color: Colors.green,
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			};
			break;
		}

		case "shards": {
			embed = {
				title: "Shard Stats",
				description: [
					...this.shards.map(s => `\u25FD **#${s.id}**: ${s.latency}ms | ${this.guilds.filter(g => g.shard.id === s.id).length}`)
				].join("\n"),
				timestamp: new Date().toISOString(),
				color: Colors.green,
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			};
			break;
		}
	}
	return msg.channel.createMessage({
		embed
	});
}));
