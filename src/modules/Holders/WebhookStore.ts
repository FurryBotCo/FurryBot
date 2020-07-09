import config from "../../config";
import Eris from "eris";
import FurryBot from "../../main";

class Webhook<e> {
	client: FurryBot;
	id: string;
	token: string;
	avatar?: string;
	username?: string;
	constructor(client: FurryBot, data: {
		id: string;
		token: string;
		avatar?: string;
		username?: string;
	}) {
		this.client = client;
		this.id = data.id;
		this.token = data.token;
		this.avatar = data.avatar;
		this.username = data.username;
	}

	async fetch() { return this.client.bot.getWebhook(this.id, this.token); }
	async delete(reason?: string) { return this.client.bot.deleteWebhook(this.id, this.token, reason); }
	async execute(payload: Omit<Eris.WebhookPayload, "wait">) {
		const data: Eris.WebhookPayload & { wait: true } = {
			...payload,
			wait: true
		};

		if (this.avatar && !payload.avatarURL) data.avatarURL = this.avatar;
		if (this.username && !payload.username) data.username = this.username;
		return this.client.bot.executeWebhook(this.id, this.token, data);
	}
}

export default class WebhookStore<W extends string = keyof typeof config["webhooks"]> {
	private webhooks: Map<string, Webhook<FurryBot>>;
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
		this.webhooks = new Map();
		Object.values(config.webhooks).map((w, i) =>
			this.webhooks.set(
				Object.keys(config.webhooks)[i],
				new Webhook<FurryBot>(this.client, w)
			)
		);
	}

	get(name: W) { return this.webhooks.has(name) ? this.webhooks.get(name) : null; }
}
