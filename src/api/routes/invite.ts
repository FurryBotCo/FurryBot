import Eris from "eris";
import { Route } from "..";
import config from "../../config";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";
import Language from "../../util/Language";
import Logger from "../../util/Logger";
import Redis from "../../util/Redis";

export default class AppealRoute extends Route {
	constructor() {
		super("/invite");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/add", async (req, res) =>
				res.redirect(config.client.socials.discordInviteSource(req.query.source?.toString()?.toLowerCase() as any || "botapi"))
			)
			.get("/support", async (req, res) => {
				// support server analytics
				res.redirect(config.client.socials.discordWebsite);
			})
			.get("/finished", async (req, res) => {
				// storing source in state because it makes my life easier and elss cluttered
				let state: {
					source: string;
					creationTime: number;
				} = null;
				try {
					state = JSON.parse(Buffer.from(req.query.state.toString(), "base64").toString());
				} catch (e) { }
				const src = ((state && state.source) || "unknown").toUpperCase();
				if (req.query.error) return res.status(400).end(`Type: ${req.query.error}\nDescription: ${decodeURIComponent(req.query.error_description.toString())}`);
				if (!req.query.code) return res.status(400).end("Missing \"code\" in request.");
				if (!req.query.guild_id) return res.status(400).end("Missing \"guild_id\" in request.");
				const perms = Number(req.query.permissions) || 0;

				const auth: ThenReturnType<typeof Internal["authorizeOAuth"]> | Error = await Internal.authorizeOAuth(req.query.code.toString(), config.web.oauth2.redirectURLInviteFinished).catch(err => err);
				if (auth instanceof Error) {
					Logger.error(["Bot API", "Invite", "Auth"], auth);
					return res.status(400).end("Failed to authorize code.");
				}
				const user: ThenReturnType<typeof Internal["getSelfUser"]> | Error = await Internal.getSelfUser(auth.access_token).catch(err => err);
				if (user instanceof Error || !user?.username || !user?.discriminator) {
					Logger.error(["Bot API", "Invite", "getSelfUser"], user);
					return res.status(400).end("Failed to fetch Discord user from code.");
				}

				const g: Eris.Guild = client.bot.guilds.get(req.query.guild_id.toString()) || await client.bot.getRESTGuild(req.query.guild_id.toString()).catch(err => null);
				if (!g) return res.status(500).end("Failed to fetch server.");
				const o: Eris.User = client.bot.users.get(g.ownerID) || await client.getUser(g.ownerID).catch(err => null);

				await Redis.setex(`invites:${g.id}`, 120, JSON.stringify({
					inviter: user.id,
					permissions: perms,
					source: src
				}));

				await Redis.incr(`stats:inviteSources:${src}`);

				return res.status(200).render("invite-finished", {
					prefix: config.defaults.prefix,
					support: config.client.socials.discord
				});
			});
	}
}
