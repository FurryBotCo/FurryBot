/// <reference path="../../util/@types/Vote.d.ts" />
/// <reference path="../../util/@types/db.d.ts" />
import { Route } from "..";
import { mdb } from "../../util/Database";
import config from "../../config";
import Logger from "../../util/Logger";
import express from "express";

export default class VoteRoute extends Route {
	constructor() {
		super("/vote");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.post("/dbl", async (req: express.Request<unknown, unknown, Vote.DBLVote>, res) => {
				if (!req.headers.authorization) return res.status(401).json({ success: false, error: "Missing authentication." });
				if (req.headers.authorization !== config.voteKeys.dbl) return res.status(401).json({ success: false, error: "Invalid authentication." });
				if (req.body.bot !== config.client.id) return res.status(403).json({ success: false, error: "Invalid client id." });
				const time = Date.now();
				await mdb.collection<Votes.DBLVote>("votes").insertOne({
					user: req.body.user,
					weekend: req.body.isWeekend,
					query: req.body.query,
					type: req.body.type,
					time
				});
				const u = client.bot.users.has(req.body.user) ? client.bot.users.get(req.body.user) : await client.getUser(req.body.user);
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

				Logger.debug(["Voting", "DBL"], `Vote on DBL by user ${u.username}#${u.discriminator} (${u.id})`);
				await u.getDMChannel().then(dm => dm.createMessage(`Hey, thanks for voting for me! The only current reward is Double EXP for leveling, and less cooldown between leveling on weekends! You can suggest some more rewards with \`${config.defaults.prefix}suggest\`!`)).catch(err => null);
				return res.status(200).json({
					success: true,
					data: {
						time
					}
				});
			})
			.post("/dboats", async (req: express.Request<unknown, unknown, Vote.DBoatsVote>, res) => {
				if (!req.headers.authorization) return res.status(401).json({ success: false, error: "Missing authentication." });
				if (req.headers.authorization !== config.voteKeys.dboats) return res.status(401).json({ success: false, error: "Invalid authentication." });
				if (req.body.bot.id !== config.client.id) return res.status(403).json({ success: false, error: "Invalid client id." });
				const time = Date.now();
				await mdb.collection<Votes.DBoatsVote>("votes").insertOne({
					user: req.body.user.id,
					time
				});
				const u = client.bot.users.has(req.body.user.id) ? client.bot.users.get(req.body.user.id) : await client.getUser(req.body.user.id);
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
								`Voted on [dboats](https://discord.boats/bot/${config.client.id})`
							].join("\n"),
							color: Math.floor(Math.random() * 0xFFFFFF)
						}
					]
				});

				Logger.debug(["Voting", "DBoats"], `Vote on DBoats by user ${u.username}#${u.discriminator} (${u.id})`);
				await u.getDMChannel().then(dm => dm.createMessage(`Hey, thanks for voting for me! The only current reward is Double EXP for leveling! You can suggest some more rewards with \`${config.defaults.prefix}suggest\`!`)).catch(err => null);
				return res.status(200).json({
					success: true,
					data: {
						time
					}
				});
			});
	}
}
