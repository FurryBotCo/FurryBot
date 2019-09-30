import express from "express";
import config from "../../config";
import functions from "../../util/functions";
import client from "../../../";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).json({
	success: true,
	clientStatus: "online"
}));

export default app;
