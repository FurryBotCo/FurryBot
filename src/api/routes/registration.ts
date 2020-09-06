import { Route } from "..";

export default class CallbackRoute extends Route {
	constructor() {
		super("/registration");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.use(async (req, res, next) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				} else return next();
			})
			.get("/", async (req, res) => {
				const servers = client.bot.guilds.filter(g => g.members.has(req.data.user.id) && g.permissionsOf(req.data.user.id).has("manageGuild"));

				return res.status(200).render("registration/servers", {
					servers
				});
			})
			.get("/:id", async (req, res) => {

				return res.status(200).render("registration/server");
			})
			.get("/:id/questions/create", async (req, res) => {
				const srv = client.bot.guilds.get(req.params.id);
				const rr = srv.members.get(client.bot.user.id).roles.map(r => srv.roles.get(r)).sort((a, b) => b.position - a.position)?.[0] || null;
				if (!srv.members.has(req.data.user.id) || !srv.permissionsOf(req.data.user.id).has("manageGuild")) return res.status(401).end("You do not have access to this server.");
				return res.status(200).render("registration/questions/create", {
					serverName: srv.name,
					roles: Array.from(srv.roles.values()).filter(r => r.id !== srv.id).sort((a, b) => b.position - a.position).map(r => ({
						name: r.name.replace(/'/g, "&apos;"),
						id: r.id,
						above: !rr || (r.position >= rr.position),
						managed: r.managed
					}))
				});
			})
			.use(async (req, res) => res.status(404).end("Not found."));
	}
}
