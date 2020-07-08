import { Route } from "..";
import config from "../../config";
import Twitter from "../../modules/External/Twitter";
import Logger from "../../util/LoggerV10";
import db from "../../modules/Database";
import { Internal } from "../../util/Functions";
import phin from "phin";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default class CallbackRoute extends Route {
	constructor() {
		super("/cb");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/discord.bio", async (req, res) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				const d = await phin({
					method: "GET",
					url: `https://api.discord.bio/v1/user/details/${req.session.user.id}`,
					headers: {
						"User-Agent": config.web.userAgent
					}
				});

				if (d.statusCode !== 200) return res.status(400).end("It seems like you don't have a profile on discord.bio. Make sure you're signed in to the right account.");
				const b = JSON.parse(d.body.toString());

				const u = await db.getUser(req.session.user.id);

				if (!!u.socials.find(s => s.type === "discord.bio" && s.id === req.session.user.id)) {
					await this.client.w.get("social").execute({
						username: `Furry Bot${config.beta ? " Beta " : " "}Socials Logs`,
						avatarURL: "https://i.furry.bot/furry.png",
						embeds: [
							new EmbedBuilder("en")
								.setAuthor(`${req.session.user.username}#${req.session.user.discriminator}`, req.session.user.avatarURL)
								.setTitle("Duplicate Social Link: Discord.Bio")
								.setTimestamp(new Date().toISOString())
								.setDescription([
									`URL: [https://dsc.bio/${b.payload.user.details.slug}](https://dsc.bio/${b.payload.user.details.slug})`
								].join("\n"))
								.setColor(Colors.red)
								.toJSON()
						]
					});
					Logger.debug("Discord.Bio Social Callback", `User ${req.session.user.username}#${req.session.user.discriminator} (${req.session.user.id}) tried to link a duplicate Discord.Bio account, ${b.payload.user.details.slug} (${req.session.user.id}).`);
					return res.status(400).end("Duplicate account detected. To refresh your handle, remove the account and log back in.");
				}

				await u.mongoEdit({
					$push: {
						socials: {
							type: "discord.bio",
							id: req.session.user.id,
							slug: b.payload.user.details.slug
						}
					}
				});

				Logger.debug("Discord.Bio Social Callback", `User ${req.session.user.username}#${req.session.user.discriminator} (${req.session.user.id}) linked their Discord.Bio account, ${b.payload.user.details.slug} (${req.session.user.id}).`);
				await this.client.w.get("social").execute({
					username: `Furry Bot${config.beta ? " Beta " : " "}Socials Logs`,
					avatarURL: "https://i.furry.bot/furry.png",
					embeds: [
						new EmbedBuilder("en")
							.setAuthor(`${req.session.user.username}#${req.session.user.discriminator}`, req.session.user.avatarURL)
							.setTitle("Successful Social Link: Discord.Bio")
							.setTimestamp(new Date().toISOString())
							.setDescription([
								`URL: [https://dsc.bio/${b.payload.user.details.slug}](https://dsc.bio/${b.payload.user.details.slug})`
							].join("\n"))
							.setColor(Colors.green)
							.toJSON()
					]
				});
				return res.status(200).end("Finished, check your profile (f!uinfo).");
			})
			.get("/reddit", async (req, res) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				if (req.query.error) {
					switch (req.query.error.toString().toLowerCase()) {
						case "access_denied": {
							return res.status(400).end("You denied the request.");
							break;
						}

						default: {
							Logger.error("Reddit Social Callback", `Query Error: ${req.query.error}`);
							return res.status(400).end("Unknown Reddit error.");
						}
					}
				}

				if (!req.query.state || req.query.state !== req.session.state) return res.status(400).end("Invalid state.");

				if (!req.query.code) return res.status(400).end("Missing code.");

				const c = config.beta ? config.apiKeys.reddit.beta : config.apiKeys.reddit.prod;

				interface RResponse {
					access_token: string;
					token_type: "bearer";
					expires_in: number;
					scope: string;
					refresh_token?: string; // will not be present due to temporary access
				}

				const r = await phin<RResponse>({
					method: "POST",
					url: "https://www.reddit.com/api/v1/access_token",
					form: {
						grant_type: "authorization_code",
						code: req.query.code.toString(),
						redirect_uri: c.callbackURL
					},
					headers: {
						"User-Agent": config.web.userAgent,
						"Authorization": `Basic ${Buffer.from(`${c.clientId}:${c.secret}`).toString("base64")}`
					},
					parse: "json"
				});

				if (r.statusCode !== 200) {
					Logger.error("Reddit Callback Router", `non 200-OK: ${r.statusCode} ${r.statusMessage}`);
					Logger.error("Reddit Callback Router", JSON.stringify(r.body));
					return res.status(500).end("Unknown internal error.");
				}

				const us = await phin({
					method: "GET",
					url: "https://oauth.reddit.com/api/v1/me",
					headers: {
						"User-Agent": config.web.userAgent,
						"Authorization": `Bearer ${r.body.access_token}`
					}
				});

				if (us.statusCode !== 200) {
					Logger.error("Reddit Callback Router", `non 200-OK: ${us.statusCode} ${us.statusMessage}`);
					Logger.error("Reddit Callback Router", JSON.stringify(us.body.toString()));
					return res.status(500).end("Unknown internal error.");
				}

				let user: {
					// definitely not all it returns, but really all we care about right now
					name: string;
					id: string;
				};
				try {
					user = JSON.parse(us.body.toString());
				} catch (e) {
					Logger.error("Reddit Callback Router", e);
					Logger.error("Reddit Callback Router", us.body.toString());
					return res.status(500).end("Unknown internal error.");
				}

				const u = await db.getUser(req.session.user.id);

				if (!!u.socials.find(s => s.type === "reddit" && s.id === user.id)) {
					Logger.debug("Reddit Social Callback", `User ${req.session.user.username}#${req.session.user.discriminator} (${req.session.user.id}) signed in with a duplicate Reddit account, @${user.name} (${user.id}).`);
					await this.client.w.get("social").execute({
						username: `Furry Bot${config.beta ? " Beta " : " "}Socials Logs`,
						avatarURL: "https://i.furry.bot/furry.png",
						embeds: [
							new EmbedBuilder("en")
								.setAuthor(`${req.session.user.username}#${req.session.user.discriminator}`, req.session.user.avatarURL)
								.setTitle("Duplicate Social Link: Reddit")
								.setTimestamp(new Date().toISOString())
								.setDescription([
									`URL: [https://www.reddit.com/user/${user.name}](https://www.reddit.com/user/${user.name})`,
									`Username: **${user.name}**`,
									`ID: **${user.id}**`
								].join("\n"))
								.setColor(Colors.red)
								.toJSON()
						]
					});
					return res.status(400).end("Duplicate account detected. To refresh your username, remove the account and log back in.");
				}

				await u.mongoEdit({
					$push: {
						socials: {
							type: "reddit",
							id: user.id,
							username: user.name
						}
					}
				});

				// revoke after done
				await phin({
					method: "POST",
					url: "https://www.reddit.com/api/v1/revoke_token",
					form: {
						token: r.body.access_token,
						token_type_hint: "access_token"
					},
					headers: {
						"User-Agent": config.web.userAgent,
						"Authorization": `Basic ${Buffer.from(`${c.clientId}:${c.secret}`).toString("base64")}`
					}
				}).catch(err => null);

				Logger.debug("Reddit Social Callback", `User ${req.session.user.username}#${req.session.user.discriminator} (${req.session.user.id}) signed in with Reddit, @${user.name} (${user.id}).`);

				await this.client.w.get("social").execute({
					username: `Furry Bot${config.beta ? " Beta " : " "}Socials Logs`,
					avatarURL: "https://i.furry.bot/furry.png",
					embeds: [
						new EmbedBuilder("en")
							.setAuthor(`${req.session.user.username}#${req.session.user.discriminator}`, req.session.user.avatarURL)
							.setTitle("Successful Social Link: Reddit")
							.setTimestamp(new Date().toISOString())
							.setDescription([
								`URL: [https://www.reddit.com/user/${user.name}](https://www.reddit.com/user/${user.name})`,
								`Username: **${user.name}**`,
								`ID: **${user.id}**`
							].join("\n"))
							.setColor(Colors.green)
							.toJSON()
					]
				});

				return res.status(200).end("Finished, check your profile (f!uinfo).");
			})
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
						Logger.error("Twitter Social Callback", err);
						return res.status(500).end("Internal Server Error.");
					}

					delete req.session.tokenSecret;

					const u = await db.getUser(req.session.user.id);

					if (!!u.socials.find(s => s.type === "twitter" && s.id === user.userId)) {
						Logger.debug("Twitter Social Callback", `User ${req.session.user.username}#${req.session.user.discriminator} (${req.session.user.id}) signed in with a duplicate Twitter account, @${user.userName} (${user.userId}).`);
						await this.client.w.get("social").execute({
							username: `Furry Bot${config.beta ? " Beta " : " "}Socials Logs`,
							avatarURL: "https://i.furry.bot/furry.png",
							embeds: [
								new EmbedBuilder("en")
									.setAuthor(`${req.session.user.username}#${req.session.user.discriminator}`, req.session.user.avatarURL)
									.setTitle("Duplicate Social Link: Twitter")
									.setTimestamp(new Date().toISOString())
									.setDescription([
										`URL: [https://twitter.com/${user.userName}](https://twitter.com/intent/user?user_id=${user.userId})`,
										`Username: **${user.userName}**`,
										`ID: **${user.userId}**`
									].join("\n"))
									.setColor(Colors.red)
									.toJSON()
							]
						});
						return res.status(400).end("Duplicate account detected. To refresh your username, remove the account and log back in.");
					}

					await u.mongoEdit({
						$push: {
							socials: {
								type: "twitter",
								id: user.userId,
								username: user.userName
							}
						}
					});

					Logger.debug("Twitter Social Callback", `User ${req.session.user.username}#${req.session.user.discriminator} (${req.session.user.id}) signed in with Twitter, @${user.userName} (${user.userId}).`);

					await this.client.w.get("social").execute({
						username: `Furry Bot${config.beta ? " Beta " : " "}Socials Logs`,
						avatarURL: "https://i.furry.bot/furry.png",
						embeds: [
							new EmbedBuilder("en")
								.setAuthor(`${req.session.user.username}#${req.session.user.discriminator}`, req.session.user.avatarURL)
								.setTitle("Successful Social Link: Twitter")
								.setTimestamp(new Date().toISOString())
								.setDescription([
									`URL: [https://twitter.com/${user.userName}](https://twitter.com/intent/user?user_id=${user.userId})`,
									`Username: **${user.userName}**`,
									`ID: **${user.userId}**`
								].join("\n"))
								.setColor(Colors.green)
								.toJSON()
						]
					});

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
