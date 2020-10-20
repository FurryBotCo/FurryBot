import { mdb, db } from "../Database";
import UserConfig from "../config/UserConfig";
import config from "../../config";
import FurryBot from "../../main";
import { Colors } from "../Constants";
import GuildConfig from "../config/GuildConfig";
import Eris from "eris";
import Internal from "./Internal";
import DailyJoins from "../handlers/DailyJoinsHandler";
import Logger from "../Logger";

export default class TimedTasks {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async runAll(client: FurryBot) {
		const d = new Date();
		if (d.getSeconds() === 0) {
			if (d.getMinutes() === 0) {
				await this.runDeleteUsers(client).then(() => Logger.debug("Timed Tasks |  Delete Users", "Finished processing."));
				await this.runDeleteGuilds(client).then(() => Logger.debug("Timed Tasks |  Delete Guilds", "Finished processing."));
				if (!config.beta && d.getHours() === 0) await this.runDailyJoins(client).then(() => Logger.debug("Timed Tasks | Daily Joins", "Finished processing."));
			}
		}
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
		if (client.cluster.id !== 0) return;
		DailyJoins(client);
	}

	static async runRefreshBoosters(client: FurryBot) {
		if (client.cluster.id !== 0) return;
		const g = await client.bot.getRESTGuild(config.client.supportServerId);
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
}
