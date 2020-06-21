import { Route } from "..";
import config from "../../config";
import * as fs from "fs-extra";
import db from "../../modules/Database";

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
			.get("/confirm", async (req, res) => {
				if (!req.query.type) return res.status(400).end("Missing type.");
				const u = await db.getUser(req.session.user.id);

				switch (req.query.type.toString()) {
					case "twitter": {
						if (!req.query.id) return res.status(400).end("Missing id.");
						const s = u.socials.find(s => s.id === req.query.id.toString());
						if (!s) return res.status(400).end("Id not found in your socials.");
						await u.mongoEdit({
							$pull: {
								socials: s
							}
						});
						return res.status(200).end(`Unlinked Twitter @${s.username}.`);
						break;
					}

					default: {
						return res.status(400).end("Invalid type.");
					}
				}
			});
	}
}
