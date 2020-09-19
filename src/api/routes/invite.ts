import Eris from "eris";
import { Route } from "..";
import config from "../../config";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";

export default class AppealRoute extends Route {
	constructor() {
		super("/invite");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/finished/:source", async (req, res) => {
				if (!req.query.code) return res.status(400).end("Missing &quot;code&quot; in request.");
				if (!req.query.guild_id) return res.status(400).end("Missing &quot;guild_id&quot; in request.");
				const perms = Number(req.query.permissions) || 0;

				const auth: ThenReturnType<typeof Internal["authorizeOAuth"]> = await Internal.authorizeOAuth(req.query.code.toString(), config.web.oauth2.redirectURLInvite(req.params.source.toString().toLowerCase())).catch(err => null);
				if (!auth) return res.status(400).end("Failed to authorize code.");
				const user: ThenReturnType<typeof Internal["getSelfUser"]> = await Internal.getSelfUser(auth.access_token).catch(err => null);
				if (!user) return res.status(400).end("Failed to fetch Discord user from code.");

				const g: Eris.Guild = client.bot.guilds.get(req.query.guild_id.toString()) || await client.bot.getRESTGuild(req.query.guild_id.toString()).catch(err => null);
				if (!g) return res.status(500).end("Failed to fetch server.");
				const o: Eris.User = client.bot.users.get(g.ownerID) || await client.bot.getRESTUser(g.ownerID).catch(err => null);

				await client.w.get("invites").execute({
					embeds: [
						new EmbedBuilder(config.devLanguage)
							.setTitle(`{lang:other.serverInvite.title|${g.name}}`)
							.setDescription(`{lang:other.serverInvite.desc|${g.name}|${g.id}|${!o ? "Unknown#0000" : `${o.username}#${o.discriminator}`}|${g.ownerID}|${g.memberCount}|${user.username}#${user.discriminator}|${user.id}|${perms}|${req.params.source}}`)
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
