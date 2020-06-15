import Eris from "eris";
import { Base } from "eris-sharder";
import FurryBot from "../main";


export default class MessageCollector {
	client: FurryBot;
	collectors: {
		channel: string;
		filter: (msg: Eris.Message) => boolean;
		resolve: (value: Eris.Message[] | Eris.Message) => void;
		limit: number;
		messages: Eris.Message[];
		timeout: number;
		i: NodeJS.Timeout;
	}[];
	constructor(client: FurryBot) {
		this.client = client;
		this.collectors = [];
		this.client.bot.on("messageCreate", this.processMessage.bind(this));
	}

	async processMessage(msg: Eris.Message) {
		if (msg.author.bot) return;
		const collectors = this.collectors.filter(col => col.channel === msg.channel.id);
		for (const c of collectors) {
			if (c && c.filter(msg)) c.messages.push(msg);
			if (c.messages.length >= c.limit) {
				clearTimeout(c.i);
				c.resolve(c.limit === 1 ? c.messages[0] : c.messages);
			}
		}
	}

	async awaitMessages<T extends Eris.TextableChannel = Eris.GuildTextableChannel>(channelId: string, timeout: number, filter: (msg: Eris.Message<T>) => boolean, limit: number): Promise<Eris.Message<T>[]>;
	async awaitMessages<T extends Eris.TextableChannel = Eris.GuildTextableChannel>(channelId: string, timeout: number, filter?: (msg: Eris.Message<T>) => boolean, limit?: 1): Promise<Eris.Message<T>>;
	async awaitMessages<T extends Eris.TextableChannel = Eris.GuildTextableChannel>(channelId: string, timeout: number, filter?: (msg: Eris.Message<T>) => boolean, limit?: number): Promise<Eris.Message<T>[] | Eris.Message<T>> {
		return new Promise((a, b) => {
			this.collectors.push({
				channel: channelId,
				filter: !!filter ? filter : () => true,
				resolve: a as any,
				limit: limit || 1,
				messages: [],
				timeout,
				i: setTimeout(a.bind(null, []), timeout)
			});
		});
	}
}
