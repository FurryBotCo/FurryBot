import { Route } from "..";
import config from "../../config";
import { Internal, Strings } from "../../util/Functions";

export default class DiscordRoute extends Route {
	constructor() {
		super("/discord");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/login", async (req, res) => {
				req.session.state = Strings.random(32);
				return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.client.id}&scope=${config.web.oauth2.scopes.join("%20")}&response_type=code&redirect_uri=${encodeURIComponent(config.web.oauth2.redirectURL)}&state=${req.session.state}`);
			})
			.get("/cb", async (req, res) => {
				if (!req.query.code) return res.status(400).render("error", { title: "Bad Request", status: 400, message: "Missing 'code' in query, please try again later." });
				if (!req.query.state) return res.status(400).render("error", { title: "Bad Request", status: 400, message: "Missing 'state' in query, please try again later." });
				if (req.query.state !== req.session.state) return res.status(400).render("error", { title: "Bad Request", status: 400, message: "Invalid 'state' in query, please try again later." });

				const c = await Internal.authorizeOAuth(req.query.code as string);

				if (c instanceof Error) {
					this.client.log("error", c, "OAuth");
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

				req.session.user = client.bot.users.has(user.id) ? client.bot.users.get(user.id) : await client.bot.getRESTUser(user.id);

				return res.redirect(req.session.return || "/");
			})
			.get("/logout", async (req, res) => req.session.destroy(() => res.status(200).render("logout")));
	}
}
