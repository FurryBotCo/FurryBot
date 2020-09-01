import { Route } from "..";
import config from "../../../config";
import Internal from "../../../util/Functions/Internal";
import Redis from "../../../util/Redis";

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
				let k: string | number = await Redis.get(`stats:dailyJoins:${id}`).then(v => !v ? 0 : (st.guilds || client.bot.guilds.size) - Number(v));
				if (!k) k = "Unknown.";
				else k = ((st.guilds || client.bot.guilds.size) - Number(k)).toString();
				const stats = await client.sh.getStats();

				return res.status(200).json({
					success: true,
					clientStatus: "online",
					guildCount: (st.guilds || client.bot.guilds.size),
					userCount: (st.users || client.bot.users.size),
					shardCount: (st.shards || client.bot.shards.size),
					largeGuildCount: (st.largeGuilds || client.bot.guilds.filter(g => g.large).length),
					botVersion: config.version,
					library: "eris",
					libraryVersion: require("eris").VERSION,
					nodeVersion: process.version,
					dailyJoins: k,
					commandCount: client.cmd.commands.length,
					commandsRan: stats.commands.general,
					messageCount: stats.messages.general,
					dmMessageCount: stats.directMessages.general
				});
			});
	}
}
