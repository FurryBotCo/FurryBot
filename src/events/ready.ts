import ClientEvent from "../util/ClientEvent";
import config from "../config";
import { TimedTasks, Time } from "../util/Functions";
import Eris from "eris";
import * as fs from "fs";
import db from "../modules/Database";
import { Cluster } from "lavalink";
import Logger from "../util/LoggerV9";

export default new ClientEvent("ready", (async function () {
	this.track("events", "ready");
	if (this.firstReady) return this.log("warn", "Skipping ready event as it has already fired.", "Ready");
	this.firstReady = true;
	db.setClient(this);
	this.api.launch();
	const v = this.v = new Cluster({
		nodes: config.apiKeys.lavalink.map(l => ({
			password: l.password,
			userID: this.user.id,
			shardCount: this.shards.size,
			hosts: {
				rest: l.httpHost,
				ws: l.wsHost
			}
		})),
		send: (guildID, packet) => this.shards.get(Number((BigInt(guildID) >> 22n) % BigInt(this.shards.size))).sendWS(packet.op, packet.d, true),
		filter: (node, guildID) => {
			if (!this.guilds.has(guildID)) return true;
			const c = config.apiKeys.lavalink.find(n => n.wsHost === node.connection.url);
			if (!c) return true;
			return c.regions.includes(this.guilds.get(guildID).region);
		}
	});

	this
		.on("rawWS", (packet, id) => {
			switch (packet.op) {
				case 0: {
					switch (packet.t) {
						case "VOICE_STATE_UPDATE": {
							v.voiceStateUpdate(packet.d);
							break;
						}

						case "VOICE_SERVER_UPDATE": {
							v.voiceServerUpdate(packet.d);
							break;
						}

						case "GUILD_CREATE": {
							if (!!packet.d && !!packet.d.voice_states) for (const state of packet.d.voice_states) v.voiceStateUpdate(state);
							break;
						}
					}
					break;
				}
			}
		});

	v.on("event", async (d) => {
		if (!["TrackStartEvent", "TrackEndEvent", "WebSocketClosedEvent"].includes(d.type)) Logger.log("Lavalink", d);
		switch (d.type) {
			case "TrackEndEvent": {
				if (d.reason !== "FINISHED") Logger.warn("Lavalink", `Non "FINISHED" end reason "${d.reason}"`);
				const q = this.q.get(d.guildId);
				if (!q) return Logger.warn("Lavalink", `TrackEndEvent without valid queue entry`);
				const j = await q.processNext(d.track);
				if (!j) this.q.delete(q.guild.id);
				break;
			}

			case "WebSocketClosedEvent": {
				if (d.reason !== "Disconnected.") Logger.warn("Lavalink", `Non "Disconnected." close reason "${d.reason}" (code: ${d.code})`);
				break;
			}

			case "TrackExceptionEvent": {
				const q = this.q.get(d.guildId);
				if (!q) return Logger.warn("Lavalink", `TrackExceptionEvent without valid queue entry`);
				q.handleException(d.error);
			}
		}
	});

	this.editStatus("online", {
		name: `${config.defaults.prefix}help with some furries`,
		type: 0
	});

	// makes commands only load at ready
	let cmd = require("../commands");
	if (cmd.default) cmd = cmd.default;
	cmd.map(c => this.cmd.addCategory(c));
	this.log("log", `Client ready with ${this.users.size} users, in ${Object.keys(this.channelGuildMap).length} channels, of ${this.guilds.size} guilds, with ${this.cmd.commands.length} commands.`, `Ready`);


	if (fs.existsSync(`${config.dir.base}/restart.json`)) {
		const t = Date.now();
		const r = JSON.parse(fs.readFileSync(`${config.dir.base}/restart.json`).toString());
		fs.unlinkSync(`${config.dir.base}/restart.json`);

		await this.getRESTChannel(r.channel).then((ch: Eris.GuildTextableChannel) => ch.createMessage(`<@!${r.user}>, restart took **${Time.ms(t - r.time, true)}**.`));
	}

	setInterval(TimedTasks.runAll.bind(TimedTasks, this), 1e3);
}));
