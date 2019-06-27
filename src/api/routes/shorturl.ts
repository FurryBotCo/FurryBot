import express from "express";
import { mongo } from "@modules/Database";

const app = express();

app.get("/:identifier", async (req, res) => {
	const beta = ![undefined, null].includes(req.query.beta);
	const s = await mongo.db(!beta ? "furrybot" : "furrybotbeta").collection("shorturl").findOne({
		id: req.params.identifier
	});
	if (!s) return res.status(404).json({
		success: false,
		error: "invalid short code"
	});
	return res.status(200).json(s);
});

export default app;