import { Route } from "..";
import config from "../../config";
import { Internal } from "../../util/Functions";
import { mdb } from "../../modules/Database";

export default class StatsRoute extends Route {
	constructor() {
		super("/stats");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/", async (req, res) => {
				const st = await client.ipc.getStats();

				const d = new Date((Date.now() - 432e5) - 8.64e+7);
				const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
				let k = await mdb.collection("dailyjoins").findOne({ id }).then(r => r.count).catch(err => null);
				if (!k) k = "Unknown.";
				else k = (client.bot.guilds.size - k).toString();

				const stats = await Internal.getStats();

				return res.status(200).json({
					success: true,
					clientStatus: "online",
					guildCount: st.guilds,
					userCount: st.users,
					shardCount: st.shardCount,
					memoryUsage: {
						process: {
							used: Internal.memory.process.getUsed(),
							total: Internal.memory.process.getTotal()
						},
						system: {
							used: Internal.memory.system.getUsed(),
							total: Internal.memory.system.getTotal()
						}
					},
					largeGuildCount: client.bot.guilds.filter(g => g.large).length,
					botVersion: config.version,
					library: "eris",
					libraryVersion: require("eris").VERSION,
					nodeVersion: process.version,
					dailyJoins: k,
					commandCount: client.cmd.commands.length,
					commandsRan: stats.commandsAllTime,
					messageCount: stats.messages,
					dmMessageCount: stats.directMessage
				});
			});
	}
}
