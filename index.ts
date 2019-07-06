import FurryBot from "@FurryBot";
import config from "@config";
import * as fs from "fs";
import functions from "@util/functions";

const bot = new FurryBot(config.bot.token, config.bot.clientOptions);

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

	bot.logger.error(`Shard #${id} disconnected`);
})
	.on("shardReady", (id: number) => {
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
	process.kill(process.pid);
});

export default bot;