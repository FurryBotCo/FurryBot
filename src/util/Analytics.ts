import phin from "phin";

interface AnalyticsResponse {
	id: string;
	type: string;
	group: string;
	internalId: string;
	uuid: string;
}

export default class Analytics {
	key: string;
	type: string;
	group: string;
	userAgent: string;
	constructor(key: string, type: string, group: string, userAgent: string) {
		this.key = key;
		this.type = type;
		this.group = group;
		this.userAgent = userAgent;
	}

	// overloads screw up everything
	/*track(event: "command", extra: {
		messageId: string;
		userId: string;
		channelid: string;
		guildId: string;
		content: string;
		command: string;
		args: string[];
		timestamp: number;
	}): Promise<AnalyticsResponse>;
	track(event: "message", extra: {
		messageId: string;
		userId: string;
		channelid: string;
		guildId: string;
		mentionEveryone: boolean;
		mentions: string[];
		roleMentions: string[];
		channelMentions: string[];
		messageTimestamp: number;
		tts: boolean;
		type: number;
		clusterId: number;
		shardId: number;
		timestamp: number;
	}): Promise<AnalyticsResponse>;
	track(event: "debug" | "error" | "warn", extra: {
		clusterId: number;
		shardId: number;
		info: any;
		timestamp: number;
	}): Promise<AnalyticsResponse>;
	track(event: "guildCreate" | "guildDelete", extra: {
		clusterId: number;
		shardId: number;
		guildId: string;
		guildOwner: string;
		members: {
			total: number;
			online: number;
			idle: number;
			dnd: number;
			offline: number;
			bots: number;
		};
		total: number;
		timestamp: number;
	}): Promise<AnalyticsResponse>;
	track(event: "ready", extra: {
		clusterId: number;
		shardId: null;
		users: number;
		channels: number;
		guilds: number;
		timestamp: number;
	}): Promise<AnalyticsResponse>;*/
	// track(event: string, extra: {}): Promise<AnalyticsResponse>;
	async track(event: string, extra: any): Promise<AnalyticsResponse> {
		const r = await phin({
			method: "POST",
			url: `https://analytics.furry.bot/track/${this.type}/${this.group}`,
			headers: {
				"User-Agent": this.userAgent,
				"Authorization": this.key
			},
			data: {
				event,
				...extra
			},
			parse: "json"
		});

		if (r.statusCode !== 200 || !r.body.success) throw new Error(`${r.statusCode} ${r.statusMessage}: ${JSON.stringify(r.body)}`);

		return r.body;
	}
}
