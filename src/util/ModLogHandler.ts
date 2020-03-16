import FurryBot from "../main";
import * as Eris from "eris";
import { Time } from "./Functions";

class ModLogHolder {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	get<T extends Eris.Textable = Eris.TextChannel>(channelId: string) { return new ModLogHelper<T>(this.client, channelId); }
}

class ModLogHelper<T extends Eris.Textable = Eris.TextChannel> {
	client: FurryBot;
	channelId: string;
	constructor(client: FurryBot, channelId: string) {
		this.client = client;
		this.channelId = channelId;
	}

	get guildId() { return this.client.channelGuildMap[this.channelId]; }
	get guild() { return this.client.guilds.get(this.guildId); }
	get channel() { return this.guild.channels.get<T>(this.channelId); }

	async create(d: {
		target: string;
		blame: string;
		reason?: string;
		color: number;
		time?: number;
		actionName: string;
		extra?: string | string[];
		timestamp?: number;
	}) {
		const t = this.client.users.get(d.target);
		this.channel.createMessage({
			embed: {
				title: d.actionName,
				description: [
					`Target: ${t.username}#${t.discriminator} <@!${t.id}>`,
					`Reason: ${d.reason}`,
					[undefined, null].includes(d.time) ? "" : `Time: ${d.time === 0 ? "Permanent" : Time.ms(d.time, true)}`,
					...([undefined, null].includes(d.extra) ? [] : d.extra)
				].join("\n"),
				timestamp: [undefined, null].includes(d.timestamp) ? new Date().toISOString() : new Date(d.timestamp).toISOString(),
				color: d.color,
				author: {
					name: this.guild.name,
					icon_url: this.guild.iconURL
				},
				footer: {
					text: `Action carried out by ${d.blame}`
				}
			}
		});
	}
}

export {
	ModLogHelper,
	ModLogHolder
};
