import { Route } from "..";
import db, { mdb } from "../../modules/Database";
import config from "../../config";
import Eris from "eris";

export default class WarnRoute extends Route {
	constructor() {
		super("/warn");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.put("/:guild/create/:user", async (req, res) => {
				if (!req.headers.authorization || req.headers.authorization !== config.universalKey) return res.status(401).json({ success: false, error: "invalid authorization" });
				if (!req.body.blame) return res.status(400).json({ success: false, error: "missing blame" });
				if (!client.bot.guilds.has(req.params.guild)) return res.status(404).json({ success: false, error: "invalid guild" });
				const g = client.bot.guilds.get(req.params.guild);
				const u: Eris.User = await client.bot.getRESTUser(req.params.user).catch(err => null);
				const b: Eris.User = await client.bot.getRESTUser(req.body.blame).catch(err => null);
				let ch: Eris.GuildTextableChannel, msg: Eris.Message<typeof ch>;
				if (!u) return res.status(404).json({ success: false, error: "invalid user" });
				if (!b) return res.status(400).json({ success: false, error: "invalid blame" });
				const id = await db.getWarningEntryId(g.icon, u.id);
				if (!!req.body.channel) {
					const c: Eris.GuildTextableChannel = await client.bot.getRESTChannel(req.body.channel).catch(err => null) as Eris.GuildTextableChannel;
					if (!c || ![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type)) return res.status(400).json({ success: false, error: "invalid channel" });
					ch = c;
				}
				const w = await mdb.collection("warnings").insertOne({
					blameId: b.id,
					guildId: g.id,
					userId: u.id,
					id,
					reason: req.body.reason || "None Provided",
					date: Date.now()
				});

				if (!!req.body.channel) {
					msg = await client.m.create(ch, {
						type: "warn",
						target: u,
						blame: b,
						reason: req.body.reason || "None Provided",
						id
					});
				}

				return res.status(200).json({
					success: true,
					data: {
						channel: !ch ? null : ch.id,
						msg: !ch ? null : msg.id,
						guild: g.id,
						user: u.id,
						reason: req.body.reason || "None Provided",
						id,
						blame: b.id
					}
				});
			});
	}
}
