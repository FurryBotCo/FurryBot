import ClientEvent from "../util/ClientEvent";
import config from "../config";
import { TimedTasks, Time } from "../util/Functions";
import Eris from "eris";
import * as fs from "fs";
import db from "../modules/Database";
import { Node } from "lavalink";
import Logger from "../util/LoggerV10";

export default new ClientEvent("ready", (async function () {
	this.track("events", "ready");
	if (this.firstReady) return this.log("warn", "Skipping ready event as it has already fired.", "Ready");
	this.firstReady = true;
	db.setClient(this);
	if (Number(this.clusterID) === 0) this.api.launch();
	const v = this.v = new Node({
		password: config.apiKeys.lavalink.password,
		userID: this.bot.user.id,
		shardCount: this.bot.shards.size,
		hosts: {
			rest: config.apiKeys.lavalink.httpHost,
			ws: config.apiKeys.lavalink.wsHost
		},
		send: (guildID, packet) => this.bot.shards.get(Number((BigInt(guildID) >> 22n) % BigInt(this.bot.shards.size))).sendWS(packet.op, packet.d, true)
	});

	this.bot
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
							if (packet.d && packet.d.voice_states) for (const state of packet.d.voice_states) v.voiceStateUpdate(state);
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
				if (!q) return Logger.warn("Lavalink", "TrackEndEvent without valid queue entry");
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
				if (!q) return Logger.warn("Lavalink", "TrackExceptionEvent without valid queue entry");
				q.handleException(d.error);
			}
		}
	});

	this.bot.editStatus("online", {
		name: `${config.defaults.prefix}help with some furries`,
		type: 0
	});

	// makes commands only load at ready
	const cmd = await import("../commands").then(async (d) => d.default);
	cmd.map(c => this.cmd.addCategory(c));
	this.log("log", `Cluster ready with ${this.bot.users.size} users, in ${Object.keys(this.bot.channelGuildMap).length} channels, of ${this.bot.guilds.size} guilds, with ${this.cmd.commands.length} commands.`, `Ready`);


	if (fs.existsSync(`${config.dir.base}/restart.json`)) {
		const t = Date.now();
		const r = JSON.parse(fs.readFileSync(`${config.dir.base}/restart.json`).toString());
		fs.unlinkSync(`${config.dir.base}/restart.json`);

		await this.bot.getRESTChannel(r.channel).then((ch: Eris.GuildTextableChannel) => ch.createMessage(`<@!${r.user}>, restart took **${Time.ms(t - r.time, true)}**.`));
	}

	setInterval(TimedTasks.runAll.bind(TimedTasks, this), 1e3);
}));
