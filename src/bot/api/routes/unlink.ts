import { Route } from "..";
import db from "../../../util/Database";

export default class UnlinkRoute extends Route {
	constructor() {
		super("/unlink");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.use(async (req, res, next) => {
				if (!req.session.user) {
					req.session.return = req.originalUrl;
					return res.redirect("/socials/discord");
				} else return next();
			})
			.get("/", async (req, res) => res.status(200).render("unlink/index"))
			.get("/twitter", async (req, res) => {
				const u = await db.getUser(req.session.user.id);

				const t = u.socials.filter(s => s.type === "twitter");
				if (t.length === 0) return res.status(400).end("Couldn't find any linked twitter accounts.");
				else return res.status(200).render("unlink/twitter", { accounts: t });
			})
			.get("/reddit", async (req, res) => {
				const u = await db.getUser(req.session.user.id);

				const t = u.socials.filter(s => s.type === "reddit");
				if (t.length === 0) return res.status(400).end("Couldn't find any linked reddit accounts.");
				else return res.status(200).render("unlink/reddit", { accounts: t });
			})
			.get("/discord.bio", async (req, res) => res.redirect(`/confirm?type=discord.bio&id=${req.session.user.id}`))
			.get("/confirm", async (req, res) => {
				if (!req.query.type) return res.status(400).end("Missing type.");
				const u = await db.getUser(req.session.user.id);

				switch (req.query.type.toString()) {
					case "twitter": {
						if (!req.query.id) return res.status(400).end("Missing id.");
						const s = u.socials.find(s => s.id === req.query.id.toString() && s.type === "twitter") as Socials.Twitter;
						if (!s) return res.status(400).end("Id not found in your socials.");
						await u.mongoEdit({
							$pull: {
								socials: s
							}
						});
						return res.status(200).end(`Unlinked Twitter @${s.username}.`);
						break;
					}

					case "reddit": {
						if (!req.query.id) return res.status(400).end("Missing id.");
						const s = u.socials.find(s => s.id === req.query.id.toString() && s.type === "reddit") as Socials.Reddit;
						if (!s) return res.status(400).end("Id not found in your socials.");
						await u.mongoEdit({
							$pull: {
								socials: s
							}
						});
						return res.status(200).end(`Unlinked Reddit @${s.username}.`);
						break;
					}

					case "discord.bio": {
						if (!req.query.id) return res.status(400).end("Missing id.");
						const s = u.socials.find(s => s.id === req.query.id.toString() && s.type === "discord.bio") as Socials.DiscordBio;
						if (!s) return res.status(400).end("Id not found in your socials.");
						await u.mongoEdit({
							$pull: {
								socials: s
							}
						});
						return res.status(200).end(`Unlinked Discord.Bio @${s.slug}.`);
						break;
					}

					default: {
						return res.status(400).end("Invalid type.");
					}
				}
			});
	}
}
