import { mdb } from "../Database";
import UserConfig from "../config/UserConfig";
import config from "../../config";
import FurryBot from "../../main";
import { Colors } from "../Constants";
import GuildConfig, { DBKeys } from "../config/GuildConfig";
import DailyJoins from "../handlers/DailyJoinsHandler";
import Logger from "../Logger";
import AutoPostingHandler from "../handlers/AutoPostingHandler";
import Utility from "./Utility";
import { performance } from "perf_hooks";

export default class TimedTasks {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async runAll(client: FurryBot) {
		const start = performance.now();
		const d = new Date();
		this.runTimedActionsHandler(client);
		if (d.getSeconds() === 0) {
			if ((d.getMinutes() % 5) === 0) await this.runAutoPosting(client).then(() => Logger.debug(`Cluster #${client.cluster.id} | Timed Tasks | Auto Posting`, "Finished processing."));
			if (d.getMinutes() === 0) {
				await this.runDeleteUsers(client).then(() => Logger.debug(`Cluster #${client.cluster.id} | Timed Tasks | Delete Users", "Finished processing.`));
				await this.runDeleteGuilds(client).then(() => Logger.debug(`Cluster #${client.cluster.id} | Timed Tasks | Delete Guilds", "Finished processing.`));
				await this.runRefreshBoosters(client).then(() => Logger.debug(`Cluster #${client.cluster.id} | Timed Tasks | Refresh Boosters", "Finished processing.`));
				if (!config.beta && d.getHours() === 0) await this.runDailyJoins(client).then(() => Logger.debug(`Cluster #${client.cluster.id} | Timed Tasks | Daily Joins`, "Finished processing."));
			}
		}
		await this.runUpdateStatus(client, d);
		if ((d.getSeconds() % 5) === 0) await this.runCalculateCPUUsage(client);
		const end = performance.now();
		if (d.getSeconds() === 0) Logger.debug(`Cluster #${client.cluster.id} | Timed Tasks`, `Total processing took ${(end - start).toFixed(3)}ms`);
	}

	static async runTimedActionsHandler(client: FurryBot) {
		client.t.processEntries.call(client.t);
	}

	static async runDeleteUsers(client: FurryBot) {
		if (client.cluster.id !== 0) return;
		const d = await mdb.collection<UserConfig>("users").find({
			$and: [
				{ deletion: { $ne: 0 } },
				{ deletion: { $ne: null } }
			]
		}).toArray();

		if (d.length === 0) {
			if (config.beta) Logger.debug("Timed Tasks |  Delete Users", "No processable entries found.");
			return;
		}

		await Promise.all(d.map(async (u) => {
			const s = await client.getUser(u.id);

			await s.getDMChannel().then(dm => dm.createMessage({
				embed: {
					title: "Data Deleted",
					description: "Your data has been purged from our database. Please note: if you send a message in another server that has me in it, a new user entry will be created.",
					timestamp: new Date().toISOString(),
					color: Colors.green
				}
			})).catch(err => null);

			await mdb.collection<UserConfig>("users").findOneAndDelete({ id: u.id });
			Logger.debug("Timed Tasks |  Delete Users", `Deleted the user "${u.id}"`);
		}));
	}

	static async runDeleteGuilds(client: FurryBot) {
		if (client.cluster.id !== 0) return;
		const d = await mdb.collection<GuildConfig>("guilds").find({
			$and: [
				{ deletion: { $ne: 0 } },
				{ deletion: { $ne: null } }
			]
		}).toArray();

		if (d.length === 0) {
			if (config.beta) Logger.debug("Timed Tasks |  Delete Guilds", "No processable entries found.");
			return;
		}

		await Promise.all(d.map(async (u) => {
			await mdb.collection<GuildConfig>("guilds").findOneAndDelete({ id: u.id });
			Logger.debug("Timed Tasks |  Delete Guild", `Deleted the guild "${u.id}"`);
		}));
	}

	static async runDailyJoins(client: FurryBot) {
		Logger.debug("Timed Tasks | Daily Joins", "run");
		if (client.cluster.id !== 0) return;
		DailyJoins(client);
	}

	static async runRefreshBoosters(client: FurryBot) {
		if (!client.bot.guilds.has(config.client.supportServerId)) return;
		const g = await client.bot.guilds.get(config.client.supportServerId);
		await g.fetchAllMembers();

		await mdb.collection("users").updateMany({
			booster: true
		}, {
			$set: {
				booster: false
			}
		});

		let i = 0;
		for (const [id, member] of g.members) {
			if (member.roles.includes(config.roles.booster)) {
				i++;
				await mdb.collection("users").findOneAndUpdate({
					id
				}, {
					$set: {
						booster: true
					}
				});
			}
		}

		Logger.debug("Timed Tasks | Refresh Boosters", `Got ${i} boosters.`);
	}

	static async runAutoPosting(client: FurryBot) {
		const d = new Date();
		const entries = await mdb.collection("guilds").find<DBKeys>({ $where: "![undefined,null].includes(this.auto) && this.auto.length > 0" }).toArray();
		for (const g of entries) {
			for (const e of g.auto) {
				if (
					((d.getMinutes() % 5) === 0 && e.time === 5) ||
					((d.getMinutes() % 10) === 0 && e.time === 10) ||
					((d.getMinutes() % 15) === 0 && e.time === 15) ||
					((d.getMinutes() % 30) === 0 && e.time === 30) ||
					((d.getMinutes() % 60) === 0 && e.time === 60)
				) {
					await AutoPostingHandler.execute(e.id, e.type, e.channel, new GuildConfig(g.id, g), client);
					Logger.debug("Timed Tasks | Auto Posting", `Ran auto posting for type "${e.type}" in channel "${e.channel}" (time: ${e.time}, id: ${e.id})`);
				}
			}
		}
	}

	// explination in index.ts
	static async runCalculateCPUUsage(client: FurryBot) {
		client.cpuUsage = await Utility.getCPUUsage();
	}

	static async runUpdateStatus(client: FurryBot, d: Date) {
		const stats = await client.ipc.getStats();
		const s = config.statuses(client, stats);
		const st = s.find(t => t.filter(d.getHours(), d.getMinutes(), d.getSeconds()));
		if (!st) return;
		else {
			await client.bot.editStatus(st.status, {
				name: st.name,
				type: st.type
			});
		}
	}
}
