import express from "express";
import config from "../../config";
import manager from "../../../";
import functions from "../../util/functions";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => !manager.ready ? res.status(400).json({
	success: false,
	error: "ClusterManager is not in the 'ready' state."
}) : res.status(200).json({
	success: true,
	guildCount: manager.stats.guilds
}));

export default app;