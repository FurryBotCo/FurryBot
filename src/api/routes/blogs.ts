import express from "express";
import { mongo } from "../../modules/Database";
import FurryBot from "../../main";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => res.status(200).json({
		success: true,
		blogs: await mongo.db("furrybot").collection("blogs").find({}).toArray().then(res => res.sort((a, b) => parseInt(a.version.replace(/\./g, ""), 10) > parseInt(b.version.replace(/\./g, ""), 10) ? -1 : parseInt(a.version.replace(/\./g, ""), 10) < parseInt(b.version.replace(/\./g, ""), 10) ? 1 : 0))
	}))
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

	return app;
});
