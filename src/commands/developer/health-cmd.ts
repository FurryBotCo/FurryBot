import Command from "../../modules/CommandHandler/Command";
import phin from "phin";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"health"
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
	const pingServers = [
		/*{
			host: "ap.ping-test.furry.bot",
			flag: "🇯🇵"
		},
		{
			host: "ca.ping-test.furry.bot",
			flag: "🇨🇦"
		},
		{
			host: "eu.ping-test.furry.bot",
			flag: "🇪🇺"
		},
		{
			host: "sa.ping-test.furry.bot",
			flag: "🇧🇷"
		},
		{
			host: "us.ping-test.furry.bot",
			flag: "🇺🇸"
		}*/
	];

	const pings = await Promise.all(pingServers.map(async (p) => {
		const k = await phin({
			method: "GET",
			url: `https://${p.host}/ping/furry.bot`,
			parse: "json",
			timeout: 2e3
		}).catch(err => null);

		if (!k) return `${p.flag} **Failed**`;
		return `${p.flag} **${k.body.data.time}ms**`;
	}));
	return msg.channel.createMessage({
		embed: {
			title: "Bot Health",
			color: Colors.green,
			description: [
				"Ping Times:",
				...pings,
				"",
				"Shard Statuses:",
				`Connecting: ${this.shards.filter(s => s.status === "connecting").length}`,
				`Disconnected: ${this.shards.filter(s => s.status === "disconnected").length}`,
				`Handshaking: ${this.shards.filter(s => s.status === "handshaking").length}`,
				`Resuming: ${this.shards.filter(s => s.status === "resuming").length}`,
				`Ready: ${this.shards.filter(s => s.status === "ready").length}`
			].join("\n")
		}
	});
}));
