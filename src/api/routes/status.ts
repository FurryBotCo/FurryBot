import express from "express";
import config from "../../config";
import functions from "../../util/functions";
import manager from "../../../";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => !manager.ready ? res.status(400).json({
	success: false,
	error: "ClusterManager is not in the 'ready' state."
}) : res.status(200).json({
	success: true,
	clientStatus: "online"
}));

export default app;