import express from "express";
import config from "../../config";
import apiFunctions from "../functions";
import FurryBot from "@FurryBot";
import Functions from "../../util/functions";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(200).json({
		success: true,
		guildCount: client.guilds.size
	}));

	return app;
});
