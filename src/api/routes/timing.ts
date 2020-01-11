import express from "express";
import { mdb, mongo } from "../../modules/Database";
import config from "../../config";
import util from "util";
import apiFunctions from "../functions";
import FurryBot from "@FurryBot";
import { ObjectID } from "mongodb";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app.get("/", async (req, res) => {
		const timing = await mdb.collection("timing").find<{
			_id: ObjectID;
			cmd: string;
			id: string;
			times: {
				[k in "main" | "messageProcess" | "blacklist" | "dm" | "autoResponse" | "cmd"]: {
					start: number;
					end: number;
				};
			};
		}>({}).sort({ _id: 1 }).limit(100).toArray();

		if (timing.length === 0) return res.status(404).render("timing", {
			times: {
				main: 0,
				messageProcess: 0,
				blacklist: 0,
				dm: 0,
				autoResponse: 0,
				cmd: 0
			},
			timing: [],
			title: "Average Processing Time (no data)"
		});

		const times: {
			[k: string]: number;
		} = {};
		Object.keys(timing[0].times).map(k => times[k] = timing.reduce((a, b) => a + Number((b.times[k].end - b.times[k].start).toFixed(3)), 0) / timing.length);

		if (typeof req.query.content !== "undefined" && req.query.content === "json") return res.status(200).json({
			success: true,
			data: {
				times,
				timing
			}
		});

		return res.status(200).render("timing", {
			times,
			timing,
			title: "Average Processing Time"
		});
	})
		.get("/:cmd", async (req, res) => {
			const timing = await mdb.collection("timing").find<{
				_id: ObjectID;
				cmd: string;
				id: string;
				times: {
					[k in "main" | "messageProcess" | "blacklist" | "dm" | "autoResponse" | "cmd"]: {
						start: number;
						end: number;
					};
				};
			}>({ cmd: req.params.cmd }).sort({ _id: 1 }).limit(100).toArray();

			if (timing.length === 0) return res.status(404).render("timing", {
				times: {
					main: 0,
					messageProcess: 0,
					blacklist: 0,
					dm: 0,
					autoResponse: 0,
					cmd: 0
				},
				timing: [],
				title: `Average Processing Time for "${req.params.cmd}" (no data)`
			});

			const times: {
				[k: string]: number;
			} = {};
			Object.keys(timing[0].times).map(k => times[k] = timing.reduce((a, b) => a + Number((b.times[k].end - b.times[k].start).toFixed(3)), 0) / timing.length);

			if (typeof req.query.content !== "undefined" && req.query.content === "json") return res.status(200).json({
				success: true,
				data: {
					times,
					timing
				}
			});

			return res.status(200).render("timing", {
				times,
				timing,
				title: `Average Processing Time for "${req.params.cmd}"`
			});
		});

	return app;
});
