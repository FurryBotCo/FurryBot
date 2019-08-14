import express from "express";
import { mdb, mongo } from "@modules/Database";
import client from "@root/index";
import functions from "@util/functions";
import config from "@src/config/config";
import util from "util";
import * as fs from "fs";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).end("Missing User ID."))
	.get("/:userId", async (req, res) => res.status(200).end("Missing Report ID."))
	.get("/:userId/:reportId", async (req, res) => {
		if (fs.existsSync(`${config.rootDir}/spam-reports/${req.params.userId}-${req.params.reportId}.log`)) return res.status(200).sendFile(`${config.rootDir}/spam-reports/${req.params.userId}-${req.params.reportId}.log`);
		else return res.status(404).end("Report not found.");
	});

export default app;