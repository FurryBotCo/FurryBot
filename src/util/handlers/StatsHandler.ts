import FurryBot from "../../main";
import ExtendedMessage from "../ExtendedMessage";
import Eris from "eris";
import Redis from "../Redis";
import Utility from "../Functions/Utility";

export default class StatsHandler {
	#client: FurryBot;
	constructor(client: FurryBot) {
		this.#client = client;
	}

	async getNumber(path: string) {
		const v = await Redis.get(path).then(Number);
		return isNaN(v) ? 0 : v;
	}

	async getUserStats(id: string) {
		// @FIXME all clusters
		const k = (p: "messages" | "commands", ...parts: string[]) => `stats:${p}:users:${id}:${parts.join(":")}`;
		const servers = this.#client.bot.guilds.filter(g => g.members.has(id)).map(s => s.id);
		const channels: string[] = servers.map(s => Array.from(this.#client.bot.guilds.get(s).channels || [null, null]).map(c => c[1])).reduce((a, b) => a.concat(b), []).filter(c => !!c).map(c => c.id);
		const stats = {
			messages: {
				servers: await Promise.all(servers.map(async (s) => ({
					[s]: await this.getNumber(k("messages", "servers", s))
				}))).then(v => v.reduce((a, b) => ({ ...a, ...b }), {})),
				channels: await Promise.all(channels.map(async (c) => ({
					[c]: await this.getNumber(k("messages", "channels", c))
				}))).then(v => v.reduce((a, b) => ({ ...a, ...b }), {})),
				total: await this.getNumber(k("messages", "total"))
			},
			commands: {
				servers: await Promise.all(servers.map(async (s) => ({
					[s]: {
						total: await this.getNumber(k("commands", "servers", s, "total")),
						commands: await Promise.all(this.#client.cmd.commands.map(async (c) => ({ [c.triggers[0]]: await this.getNumber(k("commands", "servers", s, c.triggers[0])) }))).then(res => res.reduce((a, b) => ({ ...a, ...b })))
					}
				}))).then(v => v.reduce((a, b) => ({ ...a, ...b }), {})),
				channels: await Promise.all(channels.map(async (ch) => ({
					[ch]: {
						total: await this.getNumber(k("commands", "channels", ch, "total")),
						commands: await Promise.all(this.#client.cmd.commands.map(async (c) => ({ [c.triggers[0]]: await this.getNumber(k("commands", "channels", ch, c.triggers[0])) }))).then(res => res.reduce((a, b) => ({ ...a, ...b })))
					}
				}))).then(v => v.reduce((a, b) => ({ ...a, ...b }), {})),
				general: {
					total: await this.getNumber(k("commands", "total")),
					...(await Promise.all(this.#client.cmd.commands.map(async (c) => ({ [c.triggers[0]]: await this.getNumber(k("commands", c.triggers[0])) }))).then(res => res.reduce((a, b) => ({ ...a, ...b }))))
				}
			}
		};

		return stats;
	}

	async track(...parts: string[]) {
		return Redis.incr(parts.join(":"));
	}

	joinParts(...parts: string[]) { return parts.join(":"); }

	async processMessage(msg: Eris.Message<Eris.TextableChannel> | ExtendedMessage) {
		if (msg.channel instanceof Eris.PrivateChannel) return;
		await Redis
			.multi()
			.incr(this.joinParts("stats", "messages", "servers", msg.channel.guild.id))
			.incr(this.joinParts("stats", "messages", "channels", msg.channel.id))
			.incr(this.joinParts("stats", "messages", "users", msg.author.id, "total"))
			.incr(this.joinParts("stats", "messages", "users", msg.author.id, "servers", msg.channel.guild.id))
			.incr(this.joinParts("stats", "messages", "users", msg.author.id, "channels", msg.channel.id))
			.incr(this.joinParts("stats", "messages", "general"))
			.incr(this.joinParts("stats", "messages", "session"))
			.exec();
	}

	async resetSessionStats() {
		const keys = await Utility.getKeys("stats:commands:session:*");
		await Redis.del(
			"stats:messages:session",
			"stats:directMessages:session",
			"stats:messages:session",
			"stats:commands:session:total",
			...keys
		)
	}

	async getStats() {
		return {
			messages: {
				general: await Redis.get("stats:messages:general").then(v => Number(v)),
				session: await Redis.get("stats:messages:session").then(v => Number(v))
			},
			directMessages: {
				general: await Redis.get("stats:directMessages:general").then(v => Number(v)),
				session: await Redis.get("stats:directMessages:session").then(v => Number(v))
			},
			commands: {
				general: await Redis.get("stats:commands:general:total").then(v => Number(v)),
				session: await Redis.get("stats:commands:session:total").then(v => Number(v)),
				specific: await Promise.all(this.#client.cmd.commands.map(c => c.triggers[0]).map(async (c) => ({
					general: await Redis.get(`stats:commands:general:${c}`).then(v => Number(v)),
					session: await Redis.get(`stats:commands:session:${c}`).then(v => Number(v)),
					cmd: c
				}))).then(v =>
					v
						.sort((a, b) => b.general - a.general)
						.map(v => ({
							[v.cmd]: {
								general: v.general,
								session: v.session
							}
						}))
						.reduce((a, b) => ({ ...a, ...b }), {})
				)
			}
		};
	}

	async processCommand(msg: ExtendedMessage) {
		await Redis
			.multi()
			.incr(this.joinParts("stats", "commands", "servers", msg.channel.guild.id, "total"))
			.incr(this.joinParts("stats", "commands", "servers", msg.channel.guild.id, msg.cmd.triggers[0]))
			.incr(this.joinParts("stats", "commands", "channels", msg.channel.id, "total"))
			.incr(this.joinParts("stats", "commands", "channels", msg.channel.id, msg.cmd.triggers[0]))
			.incr(this.joinParts("stats", "commands", "users", msg.author.id, "total"))
			.incr(this.joinParts("stats", "commands", "users", msg.author.id, msg.cmd.triggers[0]))
			.incr(this.joinParts("stats", "commands", "users", msg.author.id, "servers", msg.channel.guild.id, "total"))
			.incr(this.joinParts("stats", "commands", "users", msg.author.id, "servers", msg.channel.guild.id, msg.cmd.triggers[0]))
			.incr(this.joinParts("stats", "commands", "users", msg.author.id, "channels", msg.channel.id, "total"))
			.incr(this.joinParts("stats", "commands", "users", msg.author.id, "channels", msg.channel.id, msg.cmd.triggers[0]))
			.incr(this.joinParts("stats", "commands", "general", "total"))
			.incr(this.joinParts("stats", "commands", "general", msg.cmd.triggers[0]))
			.incr(this.joinParts("stats", "commands", "session", "total"))
			.incr(this.joinParts("stats", "commands", "session", msg.cmd.triggers[0]))
			.exec();
	}
}
