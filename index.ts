import FurryBot from "./src/main";
import config from "./src/config/config";
import * as fs from "fs-extra";
import functions from "./src/util/functions";
import path from "path";

// directory existence check
[config.logsDir, `${config.logsDir}/spam`, `${config.logsDir}/client`, config.tmpDir].map(l => !fs.existsSync(path.resolve(l)) ? (fs.mkdirSync(path.resolve(l)), console.log(`Creating non existent directory "${l}" in ${path.resolve(`${l}/../`)}`)) : null);

if (__filename.endsWith(".js") && !fs.existsSync(`${__dirname}/src/assets`)) {
	fs.copy(path.resolve(`${__dirname}/../src/assets`), `${__dirname}/src/assets`);
	console.log(`Copied assets directory ${path.resolve(`${__dirname}/../src/assets`)} to ${__dirname}/src/assets`);
}

const bot = new FurryBot(config.bot.token, config.bot.clientOptions);

fs.writeFileSync(`${__dirname}/process.pid`, process.pid);

bot.connect();

bot.on("shardDisconnect", (error: string, id: number) => {
	const embed = {
		title: "Shard Status Update",
		description: `Shard ${id} Disconnected!`,
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};
	bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			embed
		],
		username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});

	bot.logger.error(`Shard #${id} disconnected`, id);
})
	.on("shardReady", (id: number) => {
		bot.shards.get(id).editStatus("idle", {
			name: "Not ready yet..",
			type: 0
		});

		const embed = {
			title: "Shard Status Update",
			description: `Shard ${id} is ready!`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};
		bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
			embeds: [
				embed
			],
			username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://i.furry.bot/furry.png"
		});
	})
	.on("shardResume", (id: number) => {
		const embed = {
			title: "Shard Status Update",
			description: `Shard ${id} was resumed!`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};
		bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
			embeds: [
				embed
			],
			username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://i.furry.bot/furry.png"
		});
	})
	.on("ready", () => {
		const embed = {
			title: "Client is ready!",
			description: `Ready with ${bot.shards.size} shard${bot.shards.size > 1 ? "s" : ""}!`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};
		bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
			embeds: [
				embed
			],
			username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://i.furry.bot/furry.png"
		});
	});

process.on("unhandledRejection", (r: Error, p) => {
	let m: any = p;
	if (typeof p !== "string") {
		if (typeof p === "object") m = JSON.stringify(p);
		if (p instanceof Buffer) m = p.toString();
		if (p instanceof Function) m = p.toString();
		// if (p instanceof Promise) m = await p;
	}
	bot.logger.error(`Unhandled PromiseRejection\nPromise: ${m}\nError: ${r.stack}`);
});

process.on("SIGINT", () => {
	bot.disconnect({
		reconnect: false
	});
	fs.unlinkSync(`${__dirname}/process.pid`);
	process.kill(process.pid);
});

export default bot;