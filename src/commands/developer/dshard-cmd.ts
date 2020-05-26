import Command from "../../modules/CommandHandler/Command";
import { Colors } from "../../util/Constants";
import { Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"dshard"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["helper"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");

	switch (msg.args[0].toLowerCase()) {
		case "connect": {
			const s = Number(msg.args[1]);
			if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

			this.shards.get(s).connect();
			return msg.reply(`connected shard **#${s}**.`);
			break;
		}

		case "disconnect": {
			const s = Number(msg.args[1]);
			if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

			this.shards.get(s).disconnect({ reconnect: !!msg.args[2] });
			return msg.reply(`disconnected shard **#${s}**. ${!!msg.args[2] ? "Automatically reconnecting." : "Not reconnecting."}`);
			break;
		}

		case "restart": {
			const s = Number(msg.args[1]);
			if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

			this.shards.get(s).disconnect();
			return msg
				.reply(`restarting shard **#${s}**.`)
				.then(() =>
					this.shards.get(s).connect()
				);
			break;
		}

		case "status": {
			const s = Number(msg.args[1]);
			if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

			const shard = this.shards.get(s);

			return msg.channel.createMessage({
				embed: {
					color: shard.status === "ready" ? Colors.green : shard.status === "connecting" ? Colors.orange : Colors.red,
					timestamp: new Date().toISOString(),
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					description: [
						`Status: ${shard.status}`,
						`Ping: ${shard.latency}ms`,
						`Guilds: ${this.guilds.filter(g => g.shard.id === s).length}`,
						`Last Heartbeat Recieved: ${await Time.ms(Math.round((Date.now() - shard.lastHeartbeatReceived) / 1000) * 1000, true)} ago`,
						`Last Heartbeat Sent: ${await Time.ms(Math.round((Date.now() - shard.lastHeartbeatSent) / 1000) * 1000, true)} ago`
					].join("\n")
				}
			});
			break;
		}

		default: {
			return msg.reply("invalud subcommand.");
		}
	}
}));
