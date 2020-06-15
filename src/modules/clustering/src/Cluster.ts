import Eris from "eris";
import Base from "./Base";
import ClusterStats from "./@types/ClusterStats";
import ShardStats from "./@types/ShardStats";

export default class Cluster {
	maxShards: number;
	firstShardId: number;
	lastShardId: number;
	mainFile: string;
	token: string;
	clientOptions: Eris.ClientOptions;
	id: number;
	app: any;
	bot: Eris.Client;
	stats: ClusterStats;
	statsTime: number;
	private _setupRecieved: boolean;
	private _statsInterval: NodeJS.Timeout;
	constructor() {
		this.maxShards = 0;
		this.firstShardId = 0;
		this.lastShardId = 0;
		this.mainFile = null;
		this.token = null;
		this.clientOptions = {};
		this.id = -1;
		this.app = null;
		this.bot = null;
		this.statsTime = 0;
		this._setupRecieved = false;
		this._statsInterval = null;
	}

	processHandler() {
		process
			.on("unhandledRejection", (reason, promise) => this.log("error", "Unhandled Rejection", { reason, promise }))
			.on("uncaughtException", err => this.log("error", "Uncaught Exception", err))
			.on("message", (m) => {
				if (!m || !m.event) throw new TypeError("Invalid ipc message recieved.");

				switch (m.event) {
					case "setup": {
						if (this._setupRecieved !== false) throw new TypeError("Duplicate setup recieved.");
						this._setupRecieved = true;
						this.maxShards = Number(m.data.maxShards);
						this.firstShardId = Number(m.data.firstShardId);
						this.lastShardId = Number(m.data.lastShardId);
						this.mainFile = m.data.mainFile;
						this.id = Number(m.data.id);
						this.statsTime = Number(m.data.statsTime);
						this.token = m.data.token;
						this.clientOptions = m.data.clientOptions;

						Object.assign(this.clientOptions, {
							firstShardID: this.firstShardId,
							lastShardID: this.lastShardId,
							autoreconnect: true,
							maxShards: this.maxShards
						});

						this.setup(this.token, this.clientOptions);
						break;
					}
				}
			});
	}

	log(type: string, name: string, message: any) {
		process.send({
			event: "log",
			data: {
				type,
				message,
				name
			},
			from: this.id
		});
	}

	private setup(token: string, clientOptions: Eris.ClientOptions) {
		const bot = this.bot = new Eris.Client(token, clientOptions);

		bot
			.on("connect", (err, id) => {
				if (err) this.log("error", `Shard #${id}`, err);
				process.send({
					event: "shardConnect",
					data: {
						id
					},
					from: this.id
				});
			})
			.on("shardDisconnect", (err, id) => {
				if (err) this.log("error", `Shard #${id}`, err);
				process.send({
					event: "shardDisconnect",
					data: {
						id
					},
					from: this.id
				});
			})
			.on("shardReady", (id) => {
				process.send({
					event: "shardReady",
					data: {
						id
					},
					from: this.id
				});
			})
			.on("shardResume", (id) => {
				process.send({
					event: "shardResume",
					data: {
						id
					},
					from: this.id
				});
			})
			.on("warn", (message, id) => {
				process.send({
					event: "clientWarn",
					data: {
						id,
						message
					},
					from: this.id
				});
			})
			.on("error", (message, id) => {
				process.send({
					event: "clientError",
					data: {
						id,
						message
					},
					from: this.id
				});
			})
			.on("debug", (message, id) => {
				process.send({
					event: "clientDebug",
					data: {
						id,
						message
					},
					from: this.id
				});
			})
			.once("ready", () => {
				this.load();
				this.startStats();
			})
			.on("ready", () => {
				process.send({
					event: "ready",
					data: {},
					from: this.id
				});
			});

		bot.connect();
	}

	private load() {
		const app = require(this.mainFile.replace(/\\/g, "/"));
		if (app.prototype instanceof Base) {
			const a = this.app = new app(this);
			a.launch();
		} else {
			throw new TypeError("Main does not extend Base.");
		}
	}

	startStats(time?: number) {
		if (!!time) this.statsTime = time;
		if (!this.statsTime) return;
		this._statsInterval = setInterval(this.postStats.bind(this), this.statsTime);
	}

	endStats() {
		if (!this._statsInterval) return;
		clearInterval(this._statsInterval);
	}

	private postStats() {
		process.send({
			event: "stats",
			data: this.stats = {
				shards: this.bot.shards.map(s => ({
					id: s.id,
					ready: s.ready,
					latency: s.latency,
					status: s.status,
					guildCount: this.bot.guilds.filter(g => g.shard.id === s.id).length,
					lastHeartbeatReceived: s.lastHeartbeatReceived,
					lastHeartbeatSent: s.lastHeartbeatSent
				}) as ShardStats),
				guildCount: this.bot.guilds.size,
				channelCount: Object.keys(this.bot.channelGuildMap).length + this.bot.privateChannels.size,
				userCount: this.bot.users.size,
				voiceConnections: this.bot.voiceConnections.size,
				largeGuilds: this.bot.guilds.filter(g => g.large).length,
				id: this.id
			} as ClusterStats,
			from: this.id
		});
	}
}
