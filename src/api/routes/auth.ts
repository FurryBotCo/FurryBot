import express from "express";
import manager from "../../../";
import functions from "../../util/functions";
import config from "../../config";
import util from "util";
import apiFunctions from "../functions";
import phin from "phin";
import Cryptr from "cryptr";
const cr = new Cryptr(config.universalKey);

const app: express.Router = express.Router();

app.get("/", async (req, res) => {
	const state = `${cr.encrypt(`${req.sessionID}&url=${req.query.redirect_url ? req.query.redirect_url : `https://furry.bot`}`)}`;

	return res.redirect(302, `https://discordapp.com/api/oauth2/authorize?client_id=${config.web.oauth2.clientId}&redirect_uri=${encodeURIComponent(config.web.oauth2.redirectURL)}&response_type=code&scope=${config.web.oauth2.scopes.join("%20")}&state=${state}`);
})
	.get("/cb", async (req, res) => {
		console.log(req.session);
		console.log(req.sessionID);
		if (!req.query.code) return res.status(400).json({
			success: false,
			error: "missing 'code' in request"
		});

		if (!req.query.state) return res.status(400).json({
			success: false,
			error: "missing 'state' in request"
		});

		const state = cr.decrypt(req.query.state);

		console.log(state);

		const redirectURL = state.split("&")[1].split("=")[1];

		console.log(redirectURL);

		if (state.split("&")[0] !== req.sessionID) return res.status(400).json({
			success: false,
			error: "invalid 'state' in request"
		});

		const r = await phin({
			method: "POST",
			url: "https://discordapp.com/api/v7/oauth2/token",
			form: {
				client_id: config.web.oauth2.clientId,
				client_secret: config.web.oauth2.clientSecret,
				grant_type: "authorization_code",
				code: req.query.code,
				redirect_uri: config.web.oauth2.redirectURL,
				scope: config.web.oauth2.scopes.join(" ")
			},
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": config.web.userAgent
			},
			parse: "json"
		});

		if (r.statusCode !== 200) return res.status(400).json({
			success: false,
			error: `Error Authorizing: ${r.statusCode} ${r.statusMessage}`
		});

		const token = /*req.session.token = */r.body.access_token;

		const user = await phin({
			method: "GET",
			url: "https://discordapp.com/api/v7/users/@me",
			headers: {
				"Authorization": `Bearer ${token}`,
				"User-Agent": config.web.userAgent
			},
			parse: "json"
		});

		if (user.statusCode !== 200) return res.status(400).json({
			success: false,
			error: `Error fetching Discord user: ${user.statusCode} ${user.statusMessage}`
		});

		// req.session.user = user.body;
		// req.session.userId = user.body.id;

		if (redirectURL) return res.redirect(302, redirectURL.indexOf("furry.bot") !== -1 ? `${redirectURL}?token=${token}` : redirectURL);
		else return res.redirect(302, "https://furry.bot");
	})
	.get("/sessinfo", async (req, res, next) => {
		if (!config.beta) return next();

		if (req.session.token) return res.status(200).json({
			success: true,
			data: {
				token: req.session.token,
				user: req.session.user,
				userId: req.session.userId
			}
		});
		else return res.status(400).json({
			success: false,
			error: "not authorized with Discord"
		});
	});

export default app;