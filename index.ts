import FurryBot from "./src/main";
import config from "./src/config";
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

fs.writeFileSync(`${config.rootDir}/../process.pid`, process.pid);

bot.connect();

bot.on("shardDisconnect", async (error: string, id: number) => {
	/* await bot.track("clientEvent", "events.shardDisconnect", {
		hostname: bot.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		error,
		id
	}, new Date()); */

	const embed = {
		title: "Shard Status Update",
		description: `Shard ${id} Disconnected!`,
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};

	await bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			embed
		],
		username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});

	bot.logger.error(`Shard #${id} disconnected`, id);
})
	.on("shardReady", async (id: number) => {
		bot.shards.get(id).editStatus("idle", {
			name: "Not ready yet..",
			type: 0
		});

		/* await bot.track("clientEvent", "events.shardReady", {
			hostname: bot.f.os.hostname(),
			beta: config.beta,
			clientId: config.bot.clientID,
			id
		}, new Date()); */

		const embed = {
			title: "Shard Status Update",
			description: `Shard ${id} is ready!`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};

		await bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
			embeds: [
				embed
			],
			username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://i.furry.bot/furry.png"
		});
	})
	.on("shardResume", async (id: number) => {
		/* await bot.track("clientEvent", "events.shardResume", {
			hostname: bot.f.os.hostname(),
			beta: config.beta,
			clientId: config.bot.clientID,
			id
		}, new Date()); */

		const embed = {
			title: "Shard Status Update",
			description: `Shard ${id} was resumed!`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};

		await bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
			embeds: [
				embed
			],
			username: `Furry Bot Status${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://i.furry.bot/furry.png"
		});
	})
	.on("ready", async () => {
		const embed = {
			title: "Client is ready!",
			description: `Ready with ${bot.shards.size} shard${bot.shards.size > 1 ? "s" : ""}!`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};

		await bot.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
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
	// bot.emit("error", r);
});

process.on("SIGINT", () => {
	bot.disconnect({
		reconnect: false
	});
	fs.unlinkSync(`${config.rootDir}/../process.pid`);
	process.kill(process.pid);
});

/*process.stdin.resume();
import ev from "./src/util/eval";
import phin from "phin";
import { mdb, mongo } from "./src/modules/Database";
import util from "util";
import os from "os";
import Permissions from "./src/util/Permissions";
import { performance } from "perf_hooks";

process.stdin.on("data", async (d) => {
	d = d.toString();
	const start = performance.now();
	let res;
	let error = false;
	try {
		// an external functions is used because typescript screws with the context and the variables
		res = await ev.call(bot, ev, {
			config,
			phin,
			functions,
			util,
			fs,
			mdb,
			mongo,
			Permissions,
			os
		});
	} catch (e) {
		res = e;
		error = true;
	}
	const end = performance.now();
	if (error) process.stdout.write(`Error: ${res}\n`);
	process.stdout.write(`Eval took ${end - start}ms\n`);
});*/

export default bot;