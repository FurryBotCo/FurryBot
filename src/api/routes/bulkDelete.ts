import express from "express";
import config from "../../config";
import * as fs from "fs-extra";
import FurryBot from "../../main";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(400).end("Missing Channel ID."))
		.get("/:channelId", async (req, res) => res.status(400).end("Missing Report ID."))
		.get("/:channelId/:reportId", async (req, res) => {
			if (!fs.existsSync(`${config.dir.base}/src/assets/bulkDelete/${req.params.channelId}-${req.params.reportId}.txt`)) return res.status(404).end("Report not found.");
			const report = fs.readFileSync(`${config.dir.base}/src/assets/bulkDelete/${req.params.channelId}-${req.params.reportId}.txt`).toString();
			return res.status(200).end(report);
		});

	return app;
});
