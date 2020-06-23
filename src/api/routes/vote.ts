import { Route } from "..";
import { mdb } from "../../modules/Database";
import config from "../../config";

export default class VoteRoute extends Route {
	constructor() {
		super("/vote");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.post("/dbl", async (req, res) => {
				if (!req.headers.authorization) return res.status(401).json({ success: false, error: "Missing authentication." });
				if (req.headers.authorization !== config.universalKey) return res.status(401).json({ success: false, error: "Invalid authentication." });
				if (req.body.bot !== config.client.id) return res.status(403).json({ success: false, error: "Invalid client id." });
				const time = Date.now();
				await mdb.collection<Vote.DBLVote>("votes").insertOne({
					user: req.body.user,
					weekend: req.body.isWeekend,
					query: req.body.query,
					type: req.body.type,
					time
				});
				const u = client.bot.users.has(req.body.user) ? client.bot.users.get(req.body.user) : await client.bot.getRESTUser(req.body.user);
				await client.w.get("vote").execute({
					embeds: [
						{
							title: "Vote Performed",
							author: {
								name: `${u.username}#${u.discriminator}`,
								icon_url: u.avatarURL
							},
							footer: {
								text: `User ID: ${u.id}`
							},
							description: [
								`Voted on [dbl](https://top.gg/bot/${config.client.id})`
							].join("\n"),
							color: Math.floor(Math.random() * 0xFFFFFF)
						}
					]
				});

				client.log("debug", "DBL Vote", `Vote on DBL by user ${u.username}#${u.discriminator} (${u.id})`);
				await u.getDMChannel().then(dm => dm.createMessage(`Hey, thanks for voting for me! The only current reward is Double EXP for leveling, and less cooldown between voting on weekends! You can suggest some more rewards with \`${config.defaults.prefix}suggest\`!`)).catch(err => null);
				return res.status(200).json({
					success: true,
					data: {
						time
					}
				});
			});
	}
}
