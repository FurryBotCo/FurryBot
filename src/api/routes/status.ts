import express from "express";
import config from "../../config";
import apiFunctions from "../functions";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(200).json({
		success: true,
		clientStatus: client.shards.get(0).presence.status
	}));

	return app;
});
