import express from "express";
import { mdb, mongo } from "@modules/Database";
import client from "@root/index";
import functions from "@util/functions";
import config from "@src/config/config";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).json({ success: true, blogs: await mongo.db("furrybot").collection("blogs").find({}).toArray() }))
	.get("/:id", async (req, res) => {
		const b = await mongo.db("furrybot").collection("blogs").findOne({ version: req.params.id });
		if (!b) return res.status(404).json({
			success: false,
			error: "blog not found"
		});
		return res.status(200).json({ success: true, ...b });
	})
	.get("/id/:id", async (req, res) => {
		const b = await mongo.db("furrybot").collection("blogs").findOne({ id: req.params.id });
		if (!b) return res.status(404).json({
			success: false,
			error: "blog not found"
		});
		return res.status(200).json({ success: true, ...b });
	});

export default app;