import { Route } from "..";
import config from "../../config";
import db from "../../modules/Database";

export default class DeleteRoute extends Route {
	constructor() {
		super("/delete");
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
			.get("/user", async (req, res) => res.redirect(`/delete/user/${req.session.user.id}`))
			.get("/user/:id", async (req, res) => {
				const u = await db.getUser(req.session.user.id);
				if (req.params.id !== req.session.user.id && !config.developers.includes(req.session.user.id)) return res.status(404).render("error", { title: "You cannot delete others data." });
				if (!u) return res.status(404).render("error", { title: "Not Found", status: 404, message: `We couldn't find any data stored for you. Make sure you are signed into the right account (${req.session.user.username}#${req.session.user.discriminator}). You can <a href="/discord/logout">logout</a> here.` });
				if (u.deletion) {
					if (config.developers.includes(req.session.user.id)) return res.status(400).render("error", { title: "Process Already Started", status: 400, message: "That user is already marked for deletion." });
					else return res.status(400).render("error", { title: "Process Already Started", status: 400, message: "You have already started the deletion process." });
				}
				return res.status(200).render("delete/user", { title: "Delete Confirm", id: req.params.id });
			})
			.get("/user/:id/confirm", async (req, res) => {
				// if (!["guild", "user"].includes(req.params.type.toLowerCase())) return res.status(404).render("error", { title: "Invalid Delete Type", status: 404, message: `The delete type "${req.params.type.toLowerCase()}" is not valid.` });
				const u = await db.getUser(req.session.user.id);
				if (req.params.id !== req.session.user.id && !config.developers.includes(req.session.user.id)) return res.status(404).render("error", { title: "You cannot delete others data." });
				if (!u) return res.status(404).render("error", { title: "No Data Found", status: 400, message: `We couldn't find any data stored for you. Make sure you are signed into the right account (${req.session.user.username}#${req.session.user.discriminator}). You can <a href="/discord/logout">logout</a> here.` });
				if (u.deletion) {
					if (config.developers.includes(req.session.user.id)) return res.status(400).render("error", { title: "Process Already Started", status: 400, message: "That user is already marked for deletion." });
					else return res.status(400).render("error", { title: "Process Already Started", status: 400, message: "You have already started the deletion process." });
				}

				// give a 6 hour window for dev override
				await u.edit({ deletion: Date.now() + 2.16e+7 });
				return res.status(200).render("delete/done", { title: "Deletion Process Started", message: "Your user data will be deleted within the next 24 hours. You will recieve a direct message from <u>Furry Bot#7119</u> when the deletion has been processed." });
			})
			.get("/guild", async (req, res) => res.status(404).render("error", { title: "Missing Server ID", status: 404, messages: "A server ID was not provided." }))
			.get("/guild/:id", async (req, res) => {
				const g = await db.getGuild(req.params.id);
				if (!g) return res.status(404).render("error", { title: "No Data Found", status: 400, message: "We couldn't find any stored server data for that id." });
				if (!config.developers.includes(req.session.user.id)) {
					const j = await client.bot.getRESTGuild(req.params.id);
					if (!j) return res.status(404).render("error", { title: "Forbidden", status: 403, message: "Due to me being removed from that server, I cannot verify your ability to perform this action. Please contact a staff member to further this process." });
					const m = await j.getRESTMember(req.session.user.id);
					if (!m) return res.status(404).render("error", { title: "Unauthorized", status: 401, message: "You are not in this server, so you cannot perform this action." });
					const o = j.members.get(j.ownerID);
					if (j.ownerID !== req.session.user.id) return res.status(404).render("error", { title: "Unauthorized", status: 401, message: `Only the server owner (${o.username}#${o.discriminator}) can perform this action.` });
				}

				if (g.deletion) return res.status(400).render("error", { title: "Process Already Started", status: 400, message: "This server is already in the deletion process." });

				return res.status(200).render("delete/guild", { title: "Delete Confirm", id: req.params.id });
			})
			.get("/guild/:id/confirm", async (req, res) => {
				const g = await db.getGuild(req.params.id);
				if (!g) return res.status(404).render("error", { title: "No Data Found", status: 400, message: "We couldn't find any stored server data for that id." });
				if (!config.developers.includes(req.session.user.id)) {
					const j = await client.bot.getRESTGuild(req.params.id).catch(err => null);
					if (!j) return res.status(404).render("error", { title: "Forbidden", status: 403, message: "Due to me being removed from that server, I cannot verify your ability to perform this action. Please contact a staff member to further this process." });
					const m = j.getRESTMember(req.session.user.id).catch(err => null);
					if (!m) return res.status(404).render("error", { title: "Unauthorized", status: 401, message: "You are not in this server, so you cannot perform this action." });
					const o = j.members.get(j.ownerID);
					if (j.ownerID !== req.session.user.id) return res.status(404).render("error", { title: "Unauthorized", status: 401, message: `Only the server owner (${o.username}#${o.discriminator}) can perform this action.` });
				}

				if (g.deletion) return res.status(400).render("error", { title: "Process Already Started", status: 400, message: "This server is already in the deletion process." });

				// give a 12 hour window for dev override
				await g.edit({ deletion: Date.now() + 4.32e+7 });
				return res.status(200).render("delete/done", { title: "Deletion Process Started", message: "Your server's data will be deleted within the next 24 hours. You will recieve a direct message from <u>Furry Bot#7119</u> when the deletion has been processed." });
			});
	}
}
