import { Route } from "..";
import config from "../../config";
import Twitter from "../../util/handlers/TwitterLoginHandler";
import Logger from "../../util/Logger";
import crypto from "crypto";

export default class SocialsRoute extends Route {
	constructor() {
		super("/socials");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/", async (req, res) => res.status(200).render("socials"))
			.get("/discord.bio", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				return res.redirect("/cb/discord.bio");
			})
			.get("/reddit", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				req.data.state = crypto.randomBytes(32).toString("hex");

				const c = config.beta ? config.apiKeys.reddit.beta : config.apiKeys.reddit.prod;

				return res.redirect(`https://www.reddit.com/api/v1/authorize?client_id=${c.clientId}&response_type=${c.responseType}&state=${req.data.state}&redirect_uri=${c.callbackURL}&duration=${c.duration}&scope=${c.scopes.join("$20")}`);
			})
			.get("/twitter", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}
				return Twitter.login((err, tokenSecret, url) => {
					if (err) {
						Logger.error("Socials Router", err);
						return res.status(500).end("Internal Server Error.");
					}
					req.data.tokenSecret = tokenSecret;
					return res.redirect(url);
				});
			})
			.get("/discord", async (req, res) => {
				req.data.state = crypto.randomBytes(32).toString("hex");
				return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.client.id}&scope=${config.web.oauth2.scopes.join("%20")}&response_type=code&redirect_uri=${encodeURIComponent(config.web.oauth2.redirectURL)}&state=${req.data.state}&prompt=none`);
			});
	}
}
