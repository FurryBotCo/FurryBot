import Eris from "eris";
import { Route } from "..";
import config from "../../config";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";
import Logger from "../../util/Logger";

export default class AppealRoute extends Route {
	constructor() {
		super("/invite");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/go", async (req, res) =>
				res.redirect(config.client.socials.discordInviteSource(req.query.source?.toString()?.toLowerCase() as any || "botapi"))
			)
			.get("/finished/", async (req, res) => {
				// storing source in state because it makes my life easier and elss cluttered
				let state: {
					source: string;
					creationTime: number;
				} = null;
				try {
					state = JSON.parse(Buffer.from(req.query.state.toString(), "base64").toString());
				} catch (e) { }
				const src = (state && state.source) || "unknown";
				if (!req.query.code) return res.status(400).end("Missing &quot;code&quot; in request.");
				if (!req.query.guild_id) return res.status(400).end("Missing &quot;guild_id&quot; in request.");
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
				const o: Eris.User = client.bot.users.get(g.ownerID) || await client.bot.getRESTUser(g.ownerID).catch(err => null);

				await client.w.get("invites").execute({
					embeds: [
						new EmbedBuilder(config.devLanguage)
							.setTitle(`{lang:other.serverInvite.title|${g.name}}`)
							.setDescription(`{lang:other.serverInvite.desc|${g.name}|${g.id}|${!o ? "Unknown#0000" : `${o.username}#${o.discriminator}`}|${g.ownerID}|${g.memberCount}|${user.username}#${user.discriminator}|${user.id}|${perms}|${src.toUpperCase()}}`)
							.setFooter(`{lang:other.serverInvite.footer|${client.bot.guilds.size}}`, client.bot.user.avatarURL)
							.setTimestamp(new Date().toISOString())
							.setColor(Colors.gold)
							.toJSON()
					]
				});

				return res.status(200).render("invite-finished", {
					prefix: config.defaults.prefix,
					support: config.client.socials.discord
				});
			});
	}
}
