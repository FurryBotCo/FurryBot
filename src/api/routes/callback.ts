import { Route } from "..";
import config from "../../config";
import * as fs from "fs-extra";
import Twitter from "../../modules/External/Twitter";
import Logger from "../../util/LoggerV10";
import db, { mdb } from "../../modules/Database";
import { Internal } from "../../util/Functions";
import sickbanCmd from "../../commands/meme/sickban-cmd";

export default class CallbackRoute extends Route {
	constructor() {
		super("/cb");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/twitter", async (req, res) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				return Twitter.callback({
					oauth_token: req.query.oauth_token,
					oauth_verifier: req.query.oauth_verifier
				}, req.session.tokenSecret, async (err, user) => {
					if (err) {
						Logger.error("Callback Router", err);
						return res.status(500).end("Internal Server Error.");
					}

					delete req.session.tokenSecret;

					const u = await db.getUser(req.session.user.id);

					if (!!u.socials.find(s => s.type === "twitter" && s.id === user.userId)) {
						Logger.debug("Social Callback", `User ${user.username}#${user.discriminator} (${user.id}) signed in with a duplicate Twitter account, @${user.userName} (${user.userId}).`);
						return res.status(400).end("Duplicate account detected. To refresh your username, remove the account and log back in.");
					}

					await u.mongoEdit({
						$push: {
							socials: {
								type: "twitter",
								id: user.userId,
								username: user.userName,
								token: user.userToken,
								secret: user.userTokenSecret
							}
						}
					});

					Logger.debug("Social Callback", `User ${user.username}#${user.discriminator} (${user.id}) signed in with Twitter, @${user.userName} (${user.userId}).`);

					return res.status(200).end("Finished, check your profile (f!uinfo).");
				});
			})
			.get("/discord", async (req, res) => {
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

				Logger.debug("Social Callback", `User ${user.username}#${user.discriminator} (${user.id}) signed in with Discord.`);

				req.session.user = client.bot.users.has(user.id) ? client.bot.users.get(user.id) : await client.bot.getRESTUser(user.id);

				return res.redirect(req.session.return || "/");
			});
	}
}
