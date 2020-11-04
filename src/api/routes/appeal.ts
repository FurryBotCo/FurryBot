import { Route } from "..";
import config from "../../config";

export default class AppealRoute extends Route {
	constructor() {
		super("/appeal");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/user/:id", async (req, res) => res.status(200).end(`Appeals have not been setup yet. Come ask us about it in our <a href="${config.client.socials.discord}">Support Server</a>.`))
			.get("/guild/:id", async (req, res) => res.status(200).end(`Appeals have not been setup yet. Come ask us about it in our <a href="${config.client.socials.discord}">Support Server</a>.`));
	}
}
