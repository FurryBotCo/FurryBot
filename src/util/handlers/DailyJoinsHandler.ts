import FurryBot from "../../main";
import * as https from "https";
import config from "../../config";
import Redis from "../Redis";
import Logger from "../Logger";

async function DailyJoins(client: FurryBot) {
	const st = await client.ipc.getStats();
	const d = new Date((Date.now() - 6e4));
	const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
	let k: string | number = await Redis.get(`stats:dailyJoins:${id}`).then(v => !v ? 0 : st.guilds - Number(v));
	if (!k) k = "Unknown.";
	else k = (st.guilds - Number(k)).toString();
	Logger.log("Daily Joins", `Daily joins for ${id}: ${k}`);


	await client.w.get("dailyjoins").execute({
		embeds: [
			{
				title: `Daily Joins for ${id}`,
				description: [
					`Total Servers Joined Today: ${k}`,
					`Total Servers: ${st.guilds}`
				].join("\n"),
				timestamp: new Date().toISOString()
			}
		],
		username: `Daily Joins${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	}).catch(console.error);
}

export default DailyJoins;
