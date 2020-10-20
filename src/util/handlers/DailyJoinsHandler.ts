import FurryBot from "../../main";
import Internal from "../Functions/Internal";
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

	const count = await new Promise<number>((a, b) => {
		https.request({
			method: "GET",
			host: "sheri.bot",
			port: 443,
			protocol: "https:",
			path: "/",
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.68 Safari/537.36"
			}
		}, (res) => {
			const data = [];
			res
				.on("data", (d) => data.push(d))
				.on("error", (err) => b(err))
				.on("end", () => a(
					Number(
						Buffer.concat(data).toString().match(/(?:Currently serving [0-9,]{1,} furries in ([0-9,]{5,}) Discord servers)/)[1].replace(/,/g, "")
					)
				));
		}).end();
	});

	await client.w.get("dailyjoins").execute({
		embeds: [
			{
				title: `Daily Joins for ${id}`,
				description: [
					`Total Servers Joined Today: ${k}`,
					`Total Servers: ${st.guilds}`,
					`Sheri Total: ${count}`,
					`Difference: ${count - st.guilds}`
				].join("\n"),
				timestamp: new Date().toISOString()
			}
		],
		username: `Daily Joins${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});
}

export default DailyJoins;
