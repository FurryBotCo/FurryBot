import express from "express";
import config from "../../config";
import * as fs from "fs-extra";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(400).end("Missing Note Name."))
		.get("/:name", async (req, res) => {
			if (!fs.existsSync(`${config.dir.base}/src/assets/notes/${req.params.name}.txt`)) return res.status(404).end("Report not found.");
			const report = fs.readFileSync(`${config.dir.base}/src/assets/notes/${req.params.name}.txt`).toString();
			return res.status(200).end(report);
		});

	return app;
});
