import { Route } from "..";

export default class StatusRoute extends Route {
	constructor() {
		super("/status");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/", async (req, res) => res.status(200).json({
				success: true,
				clientStatus: !client.bot.shards.has(0) || client.bot.shards.get(0).status !== "ready" ? null : client.bot.shards.get(0).presence.status
			}));
	}
}
