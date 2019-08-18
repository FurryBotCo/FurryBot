import express from "express";
import client from "../../../";
import functions from "../../util/functions";
import config from "../../config/config";
import util from "util";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async(req, res) => res.status(200).json({ developers: config.developers, staff: config.staff }))
	.get("/dev", async(req, res) => res.status(200).json(config.developers))
	.get("/staff", async(req, res) => res.status(200).json(config.developers));

export default app;