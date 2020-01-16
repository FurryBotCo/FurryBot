import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import phin from "phin";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"health"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check my server/shard health.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const pingServers = [
		{
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
			host: "se.ping-test.furry.bot",
			flag: "🇧🇷"
		},
		{
			host: "us.ping-test.furry.bot",
			flag: "🇺🇸"
		}
	];

	const pings = await Promise.all(pingServers.map(async (p) => {
		const k = await phin({
			method: "GET",
			url: `https://${p.host}/ping/164.68.110.213`,
			parse: "json"
		});

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
				`Ready: ${this.shards.filter(s => s.status === "ready").length}`
			].join("\n")
		}
	});
}));
