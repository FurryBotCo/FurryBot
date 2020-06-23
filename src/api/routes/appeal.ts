import { Route } from "..";
import config from "../../config";
import * as fs from "fs-extra";

export default class AppealRoute extends Route {
	constructor() {
		super("/appeal");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/user/:id", async (req, res) => res.status(200).end("Appeals have not been setup yet."))
			.get("/guild/:id", async (req, res) => res.status(200).end("Appeals have not been setup yet."));
	}
}
