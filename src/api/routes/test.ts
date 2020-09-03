import { Route } from "..";
import config from "../../config";
import Redis from "../../util/Redis";

export default class StatsRoute extends Route {
	constructor() {
		super("/test");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/dump", async (req, res) => res.status(200).json({
				success: true,
				data: {
					...req.session,
					id: req.sessionID
				}
			}));
	}
}
