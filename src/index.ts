#!/usr/bin/env ts-node
import "./util/first";
import config from "./config";
import Logger from "logger";

import { Fleet, Stats } from "eris-fleet";
import Eris from "eris";
import { Colors, EmbedBuilder, WebhookStore } from "core";
import { Cluster } from "eris-fleet/dist/src/clusters/Cluster";
import { workers } from "node:cluster";
import { isMaster } from "cluster";
if (isMaster) Logger.info(`Running in ${config.beta ? "BETA" : "PRODUCTION"} mode.`);
const Admiral = new Fleet({
	...config.options,
	path: `${config.dir.codeSrc}/main.${config.ext}`,
	token: config.client.token
});
interface ObjectLog {
	source: string;
	message: string;
	timestamp: number;
}

if (isMaster) {
	let blPosted = false;
	const w = new WebhookStore<Eris.Client, keyof typeof config["webhooks"]>(new Eris.Client("kekw")).addBulk(config.webhooks);
	Admiral
		.on("log", (v: string | ObjectLog) => {
			if (typeof v === "string") return;
			// it seems like some number (worker id?) is logged after a cluster is ready
			const c = /Cluster (\d+)/.exec(v.source);
			if (c?.[1]) v.source = `Cluster #${c[1]}`;
			Logger.log(v.source, v.message);
		})
		.on("debug", (v: string | ObjectLog) => {
			if (typeof v === "string") return;
			Logger.debug(v.source, v.message);
		})
		.on("warn", (v: string | ObjectLog) => {
			if (typeof v === "string") return;
			Logger.warn(v.source, v.message);
		})
		.on("error", (v: string | ObjectLog) => {
			if (typeof v === "string") return;
			// we can safely assume the lower handle will get unhandled rejections

			if (v.message && ["Unhandled Rejection at"].some(r => v.message.toString().indexOf(r) !== -1)) return;
			Logger.error(v.source, v.message);
		})
		// temp
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		.on("stats", (stats: Stats) => {
			// eslint-disable-next-line
			/* console.log("a", require("util").inspect(stats, { depth: null, colors: true }));
			console.log("b", process.memoryUsage());
			 */const d = new Date();
			if ((d.getMinutes() % 15) === 0) {
				if (blPosted === false) {
					blPosted = true;
					// update botlist stats
					Logger.info("Bot List Stats", "Stats updated.");
				}
			} else blPosted = false;
		})
		.on("log", (v: ObjectLog) => {
			const [, a] = /^Launching service (.+)$/.exec(v.message) ?? [];
			const [, b] = /^Starting service (.+)$/.exec(v.message) ?? [];
			const [, c] = /^Service (.+) is ready!$/.exec(v.message) ?? [];
			const [, d] = /^Restarting service (.+)$/.exec(v.message) ?? [];
			const [, e] = /^Launching cluster ([0-9]+)$/.exec(v.message) ?? [];
			const [, f] = /^Connecting with ([0-9]+) shard\(s\)$/.exec(v.message) ?? [];
			const [, g, h] = /^Shards ([0-9]+) - ([0-9]+) are ready!$/.exec(v.message) ?? [];
			const [, i] = /^Restarting cluster ([0-9]+)$/.exec(v.message) ?? [];

			// service launch
			if (a) return w.get("service")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Service Launched")
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore -- https://github.com/microsoft/TypeScript/issues/43249
						.setDescription(`The service **${a}** has launched.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.orange)
						.toJSON()
				]
			});

			// service start
			if (b) return w.get("service")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Service Started")
						.setDescription(`The service **${b}** has started.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.orange)
						.toJSON()
				]
			});

			// service ready
			if (c) return w.get("service")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Service Ready")
						.setDescription(`The service **${c}** is ready.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.green)
						.toJSON()
				]
			});

			// service restart
			if (d) return w.get("service")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Service Restart")
						.setDescription(`The service **${d}** is restarting.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.orange)
						.toJSON()
				]
			});

			// cluster launch
			if (e) return w.get("cluster")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Cluster Launched")
						.setDescription(`The cluster #${Number(e) + 1} has launched.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.orange)
						.toJSON()
				]
			});

			if (v.message === "All shards spread!") return w.get("cluster")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Shards Spread")
						.setDescription("All shards have been spread between existing clusters.")
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.green)
						.toJSON()
				]
			});

			// cluster connect
			if (f) {
				const [, z] = /^Cluster #([0-9]+)$/.exec(v.source) ?? [];
				return w.get("cluster")!.execute({
					embeds: [
						new EmbedBuilder(config.devLanguage)
							.setTitle("Cluster Connecting")
							.setDescription(`Cluster #${Number(z) + 1} is connecting with **${f}** shard${Number(f) === 1 ? "" : "s"}.`)
							.setTimestamp(new Date().toISOString())
							.setColor(Colors.orange)
							.toJSON()
					]
				});
			}

			// cluster ready
			if (g && h) {
				const [, z] = /^Cluster #([0-9]+)$/.exec(v.source) ?? [];
				const y = (Number(h) - Number(g)) + 1;
				return w.get("cluster")!.execute({
					embeds: [
						new EmbedBuilder(config.devLanguage)
							.setTitle("Cluster Ready")
							.setDescription(`Cluster #${Number(z) + 1} is ready with ${y} shard${y === 1 ? "" : "s"}.`)
							.setTimestamp(new Date().toISOString())
							.setColor(Colors.green)
							.toJSON()
					]
				});
			}

			// cluster restart
			if (i) return w.get("cluster")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Cluster Restart")
						.setDescription(`Cluster #${i} is restarting.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.orange)
						.toJSON()
				]
			});
		})
		.on("warn", (v: ObjectLog) => {
			const [, a] = /^Service (.+) died :\($/.exec(v.message) ?? [];
			const [, b] = /^Cluster ([0-9]+) died :\($/.exec(v.message) ?? [];

			// service death
			if (a) return w.get("service")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Service Died")
						.setDescription(`The service **${a}** has died.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.toJSON()
				]
			});

			// cluster death
			if (b) return w.get("cluster")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle("Cluster Died")
						.setDescription(`Cluster #${b} has died.`)
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.toJSON()
				]
			});
		});
}/*  else {
	setTimeout(() => process.kill(process.pid), 3e4);
} */

process
	.on("uncaughtException", (err) => Logger.error("Uncaught Exception", err))
	.on("unhandledRejection", (r, p) => Logger.error("Unhandled Rejection", r ?? p))
	.on("SIGINT", () => {
		Object.keys(workers).map(v => workers[v]?.kill("SIGKILL"));
		process.kill(process.pid, "SIGKILL");
	});
