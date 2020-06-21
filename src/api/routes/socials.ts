import { Route } from "..";
import config from "../../config";
import * as fs from "fs-extra";
import Twitter from "../../modules/External/Twitter";
import Logger from "../../util/LoggerV10";
import { Strings } from "../../util/Functions";

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
			.get("/twitter", async (req, res) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}
				return Twitter.login((err, tokenSecret, url) => {
					if (err) {
						Logger.error("Socials Router", err);
						return res.status(500).end("Internal Server Error.");
					}
					req.session.tokenSecret = tokenSecret;
					return res.redirect(url);
				});
			})
			.get("/discord", async (req, res) => {
				req.session.state = Strings.random(32);
				return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.client.id}&scope=${config.web.oauth2.scopes.join("%20")}&response_type=code&redirect_uri=${encodeURIComponent(config.web.oauth2.redirectURL)}&state=${req.session.state}&prompt=none`);
			});
	}
}
