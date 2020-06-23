import { Route } from "..";
import config from "../../config";
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
			.get("/discord.bio", async (req, res) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				return res.redirect("/cb/discord.bio");
			})
			.get("/reddit", async (req, res) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				req.session.state = Strings.random(32);

				const c = config.beta ? config.apiKeys.reddit.beta : config.apiKeys.reddit.prod;

				return res.redirect(`https://www.reddit.com/api/v1/authorize?client_id=${c.clientId}&response_type=${c.responseType}&state=${req.session.state}&redirect_uri=${c.callbackURL}&duration=${c.duration}&scope=${c.scopes.join("$20")}`);
			})
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
