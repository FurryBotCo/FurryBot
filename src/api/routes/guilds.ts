import express from "express";
import config from "../../config/config";
import client from "../../../";
import functions from "../../util/functions";
import apiFunctions from "../functions";

const app: express.Router = express.Router();

app.get("/", async (req, res) => {
	const jsn: {
		success: boolean;
		guildCount: number;
		guilds?: {
			name: string;
			memberCount: number
		}[]
	} = {
		success: true,
		guildCount: client.guilds.size
	};
	if (apiFunctions.checkAuth(req, res, false)) {
		jsn.guilds = client.guilds.map(g => ({
			name: g.name,
			memberCount: g.memberCount
		}));
	}
	res.status(200).json(jsn);
})
	.get("/:id/shard", apiFunctions.checkAuth, async (req, res) => {
		if (!client.guilds.has(req.params.id)) return res.status(404).json({
			success: false,
			error: "invalid guild id"
		});
		return res.status(200).json({
			success: true,
			shardId: client.guilds.get(req.params.id).shard.id,
			shardCount: client.shards.size
		});
	});

export default app;