import express from "express";
import config from "../../config";
import FurryBot from "../../main";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(200).json({ developers: config.developers }));
	return app;
});
