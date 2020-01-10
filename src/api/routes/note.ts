import express from "express";
import { mdb, mongo } from "../../modules/Database";
import config from "../../config";
import util from "util";
import * as fs from "fs-extra";
import apiFunctions from "../functions";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(400).end("Missing Note Name."))
		.get("/:name", async (req, res) => {
			if (!fs.existsSync(`${config.rootDir}/src/assets/notes/${req.params.name}.txt`)) return res.status(404).end("Report not found.");
			const report = fs.readFileSync(`${config.rootDir}/src/assets/notes/${req.params.name}.txt`).toString();
			return res.status(200).end(report);
		});

	return app;
});
