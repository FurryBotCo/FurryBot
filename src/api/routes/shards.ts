import express from "express";
import { mdb } from "@modules/Database";
import client from "@root/index";
import functions from "@util/functions";
import config from "@src/config/config";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).json({
	success: true,
	shards: client.shards.map(s => ({ id: s.id, ping: s.latency, status: s.status })),
	shardCount: client.shards.size
}))
	.get("/:id", async (req, res) => {

		const s = client.shards.get(parseInt(req.params.id, 10));
		if (!s) return res.status(404).json({
			success: false,
			error: "invalid shard id"
		});

		return res.status(200).json({
			success: true,
			shard: {
				id: s.id,
				ping: s.latency,
				status: s.status
			}
		});
	});

export default app;