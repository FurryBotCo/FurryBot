import express from "express";
import config from "../../config";
import { mdb } from "../../modules/Database";
import uuid from "uuid/v4";
import Eris, * as eris from "eris";
import { Logger } from "../../util/LoggerV8";
import FurryBot from "@FurryBot";
import { Strings } from "../../util/Functions";

export default (async (client: FurryBot) => {
	const app: express.Router = express.Router();

	app.put("/:guild/create/:user", async (req, res) => {
		if (!req.headers.authorization || req.headers.authorization !== config.universalKey) return res.status(401).json({ success: false, error: "invalid authorization" });
		const id = Strings.random(7);
		if (!req.body.blame) return res.status(400).json({ success: false, error: "missing blame" });
		if (!client.guilds.has(req.params.guild)) return res.status(404).json({ success: false, error: "invalid guild" });
		const g = client.guilds.get(req.params.guild);
		const u: Eris.User = await client.getRESTUser(req.params.user).catch(err => null);
		const b: Eris.User = await client.getRESTUser(req.body.blame).catch(err => null);
		let ch: Eris.GuildTextableChannel, msg: Eris.Message<typeof ch>;
		if (!u) return res.status(404).json({ success: false, error: "invalid user" });
		if (!b) return res.status(400).json({ success: false, error: "invalid blame" });
		if (!!req.body.channel) {
			const c: Eris.GuildTextableChannel = await client.getRESTChannel<Eris.GuildTextableChannel>(req.body.channel).catch(err => null);
			if (!c || ![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type)) return res.status(400).json({ success: false, error: "invalid channel" });
			ch = c;
		}
		const w = await mdb.collection("warnings").insertOne({
			blameId: b.id,
			guildId: g.id,
			userId: u.id,
			id,
			reason: req.body.reason || "None Provided",
			date: Date.now()
		});

		if (!!req.body.channel) {
			msg = await client.m.create(ch, {
				type: "warn",
				target: u,
				blame: b,
				reason: req.body.reason || "None Provided",
				id
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				channel: !ch ? null : ch.id,
				msg: !ch ? null : msg.id,
				guild: g.id,
				user: u.id,
				reason: req.body.reason || "None Provided",
				id,
				blame: b.id
			}
		});
	});

	return app;

});
