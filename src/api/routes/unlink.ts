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
			.get("/twitter", async (req, res) => {
				const u = await db.getUser(req.session.user.id);

				const t = u.socials.filter(s => s.type === "twitter");
				if (t.length === 0) return res.status(400).end("Couldn't find any linked twitter accounts.");
				else return res.status(200).render("unlink/twitter", { accounts: t });
			});
	}
}
