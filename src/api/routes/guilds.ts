import express from "express";
import config from "../../config";
import client from "../../../";
import functions from "../../util/functions";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).json({
	success: true,
	guildCount: client.stats.guildCount
}));

export default app;
