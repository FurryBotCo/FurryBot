import express from "express";
import config from "../../config";
import * as fs from "fs-extra";
import FurryBot from "@FurryBot";
import crypto from "crypto";
import Logger from "../../util/LoggerV8";
import { Internal } from "../../util/Functions";

export default (async (client: FurryBot) => {

	const app: express.Router = express.Router();

	app
		.get("/login", async (req, res) => {
			req.session.state = crypto.randomBytes(32).toString("hex");
			return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.bot.client.id}&scope=${config.web.oauth2.scopes.join("%20")}&response_type=code&redirect_uri=${encodeURIComponent(config.web.oauth2.redirectURL)}&state=${req.session.state}`);
		})
		.get("/cb", async (req, res) => {
			if (!req.query.code) return res.status(400).render("error", { title: "Bad Request", status: 400, message: "Missing 'code' in query, please try again later." });
			if (!req.query.state) return res.status(400).render("error", { title: "Bad Request", status: 400, message: "Missing 'state' in query, please try again later." });
			if (req.query.state !== req.session.state) return res.status(400).render("error", { title: "Bad Request", status: 400, message: "Invalid 'state' in query, please try again later." });

			const c = await Internal.authorizeOAuth(req.query.code);

			if (c instanceof Error) {
				Logger.error("OAuth", c);
				return res.status(500).render("error", { title: "Internal Error", status: 500, message: "We had an internal error while authorizing, please try again later." });
			}

			req.session.discord = {
				accessToken: c.access_token,
				expiresIn: c.expires_in,
				refreshToken: c.refresh_token,
				tokenType: c.token_type,
				time: Date.now()
			};

			const user = await Internal.getSelfUser(req.session.discord.accessToken);

			if (!user) return res.status(500).render("error", { title: "Internal Error", status: 500, message: "We had an internal error while authorizing, please try again later." });

			req.session.user = client.users.has(user.id) ? client.users.get(user.id) : await client.getRESTUser(user.id);

			return res.redirect(req.session.return || "/");
		})
		.get("/logout", async (req, res) => req.session.destroy(() => res.status(200).render("logout")));
	return app;
});
