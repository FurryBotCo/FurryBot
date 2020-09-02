import { Route } from "..";
import config from "../../config";

export default class InfoRoute extends Route {
	constructor() {
		super("/info");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/", async (req, res) => res.status(200).json({
				success: true,
				data: {
					developers: config.developers,
					version: config.version
				}
			}));
	}
}
