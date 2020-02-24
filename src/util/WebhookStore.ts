import FurryBot from "../main";
import { WebhookPayload } from "eris";

class Webhook {
	client: FurryBot;
	id: string;
	token: string;
	constructor(client: FurryBot, id: string, token: string) {
		if (!client) throw new TypeError("missing client");
		if (!id) throw new TypeError("missing id");
		if (!token) throw new TypeError("missing token");
		this.client = client;
		this.id = id;
		this.token = token;
	}

	async execute(payload: WebhookPayload) {
		return this.client.executeWebhook(this.id, this.token, payload);
	}
}

export default class WebhookStore extends Map<string, Webhook> {
	client: FurryBot;
	constructor(client) {
		if (!client) throw new TypeError("missing client");
		super();
		this.client = client;
	}

	add(name: string, id: string, token: string) {
		this.set(name, new Webhook(this.client, id, token));
	}
}
