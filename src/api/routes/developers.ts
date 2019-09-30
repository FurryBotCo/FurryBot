import express from "express";
import config from "../../config";
import util from "util";
import apiFunctions from "../functions";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(200).json({ developers: config.developers, staff: config.staff }))
		.get("/dev", async (req, res) => res.status(200).json(config.developers))
		.get("/staff", async (req, res) => res.status(200).json(config.developers));

	return app;
});
