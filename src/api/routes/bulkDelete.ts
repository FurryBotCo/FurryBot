import { Route } from "..";
import config from "../../config";
import * as fs from "fs-extra";

export default class BulkDeleteRoute extends Route {
	constructor() {
		super("/bulkDelete");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/", async (req, res) => res.status(400).end("Missing Channel ID."))
			.get("/:channelId", async (req, res) => res.status(400).end("Missing Report ID."))
			.get("/:channelId/:reportId", async (req, res) => {
				if (!fs.existsSync(`${config.dir.logs.bulkDelete}/${req.params.channelId}-${req.params.reportId}.txt`)) return res.status(404).end("Log not found.");
				const report = fs.readFileSync(`${config.dir.logs.bulkDelete}/${req.params.channelId}-${req.params.reportId}.txt`).toString();
				return res.status(200).end(report);
			});
	}
}
