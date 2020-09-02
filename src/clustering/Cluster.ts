/// <reference path="../util/@types/Clustering.d.ts" />
import Eris from "eris";
import * as fs from "fs-extra";
import Logger from "../util/Logger";
import Base from "./Base";
import IPC from "./IPC";
import { performance } from "perf_hooks";
import ClusterManager from "./ClusterManager";
import { DEBUG } from "./Constants";

export default class Cluster {
	id: number;
	maxShards: number;
	token: string;
	file: string;
	class: any;
	shards: number[][];
	firstShardId: number;
	lastShardId: number;
	client: Eris.Client;
	ipc: IPC;
	options: ClusterManager["options"];
	ready: boolean;
	constructor() {
		this.id = null;
		this.maxShards = 0;
		this.token = null;
		this.file = null;
		this.shards = [];
		this.firstShardId = 0;
		this.lastShardId = 0;
		this.client = null;
		this.ipc = new IPC(this);
		this.options = null;
		this.ready = false;
		process
			.on("message", this.messageHandler.bind(this))
			.on("uncaughtException", (err) => Logger.error([`Cluster #${this.id}`, "Uncaught Exception"], err))
			.on("unhandledRejection", (r, p) => Logger.error([`Cluster #${this.id}`, "Unhandled Rejection"], (r as Error).stack || r));
	}

	get bot() { return this.client; }

	async done() {
		this.ready = true;
		this.sendMessage("DONE", null);
	}

	sendMessage(op: string, d: object) {
		process.send({
			op,
			d
		});
	}

	async messageHandler(msg: {
		op: string;
		d: any;
	}) {
		if (DEBUG) Logger.log(["CLUSTER", this.id?.toString()], msg);
		switch (msg.op) {
			case "SETUP": {
				this.id = msg.d.id;
				this.options = msg.d.options;
				this.maxShards = msg.d.maxShards;
				this.token = msg.d.token;
				this.file = msg.d.file;
				this.shards = msg.d.shards;
				this.firstShardId = msg.d.firstShardId;
				this.lastShardId = msg.d.lastShardId;

				if (!fs.existsSync(this.file)) throw new Error(`Invalid client file (${this.file}) provided.`);
				const f = await import(this.file).then(v => v.default || v);
				if (!(f.prototype instanceof Base)) throw new Error(`Provided client file (${this.file}) does not extend Base.`);

				const b = this.class = new f(this);

				const client = this.client = new Eris.Client(this.token, {
					...this.options.erisOptions,
					maxShards: this.maxShards,
					firstShardID: this.firstShardId,
					lastShardID: this.lastShardId
				});

				client
					.on("connect", (id) => this.sendMessage("EVENT", {
						type: "connect",
						id
					}))
					.on("shardDisconnect", (err, id) => this.sendMessage("EVENT", {
						type: "shardDisconnect",
						id,
						err
					}))
					.on("shardPreReady", (id) => this.sendMessage("EVENT", {
						type: "shardPreReady",
						id
					}))
					.on("shardReady", (id) => this.sendMessage("EVENT", {
						type: "shardReady",
						id
					}))
					.on("shardResume", (id) => this.sendMessage("EVENT", {
						type: "shardResume",
						id
					}))
					.once("ready", () => {
						if (!this.options.wait) this.done();
						b.launch(this.shards.length);
					})
					.on("ready", () => this.sendMessage("EVENT", {
						type: "ready"
					}));

				this.sendMessage("SETUP_COMPLETE", null);
				break;
			}

			case "CONNECT": {
				this.client.connect();
				break;
			}

			case "COMMAND": {
				switch (msg.d.type) {
					/*case "fetchGuild": {
						const g = this.client?.guilds.get(msg.d.id);
						if (!g) return this.sendMessage("COMMAND_RESPONSE", {
							type: "fetchGuild",
							callbackId: msg.d.callbackId,
							ipc: true,
							data: null
						});
						else this.sendMessage("COMMAND_RESPONSE", {
							type: "fetchGuild",
							callbackId: msg.d.callbackId,
							ipc: true,
							data: {
								member_count: g.memberCount,
								mfa_level: g.mfaLevel,
								splash: g.splash,
								discovery_splash: null, // apparently Eris doesn't use this
								large: g.large,
								afk_timeout: g.afkTimeout,
								unavailable: g.unavailable,
								icon: g.icon,
								afk_channel_id: g.afkChannelID,
								channels: g.channels.map((c) => ({
									type: c.type,
									topic: (c as Eris.GuildTextableChannel).topic,
									rate_limit_per_user: (c as Eris.GuildTextableChannel).rateLimitPerUser,
									position: c.position,
									permission_overwrites: c.permissionOverwrites.map(p => ({
										type: p.type,
										id: p.id,
										deny_new: p.deny.toString(),
										deny: p.deny,
										allow_new: p.allow.toString(),
										allow: p.allow
									})),
									parent_id: c.parentID,
									nsfw: c.nsfw,
									last_message_id: (c as Eris.GuildTextableChannel).lastMessageID,
									id: c.id,
									name: c.name,
									user_limit: (c as Eris.VoiceChannel).userLimit,
									bitrate: (c as Eris.VoiceChannel).bitrate
								})),
								preferred_locale: g.preferredLocale,
								system_channel_id: g.systemChannelID,
								public_updates_channel_id: g.publicUpdatesChannelID,
								verification_level: g.verificationLevel,
								premium_subscription_count: g.premiumSubscriptionCount,
								name: g.name,
								vanity_url_code: g.vanityURL,
								rules_channel_id: g.rulesChannelID,
								joined_at: g.joinedAt,
								members: g.members.map(m => ({
									user: {
										username: m.user.username,
										public_flags: m.user.publicFlags,
										id: m.user.id,
										discriminator: m.user.discriminator,
										bot: !!m.user.bot,
										avatar: m.user.avatar
									},
									roles: m.roles,
									mute: m.voiceState.mute,
									joined_at: m.joinedAt,
									hoisted_role: null,
									deaf: m.voiceState.deaf
								})),
								default_message_notifications: g.defaultNotifications,
								banner: g.banner,
								roles: g.roles.map(r => ({
									position: r.position,
									permissions_new: r.permissions.allow.toString(), // @FIXME
									permissions: r.permissions.allow,
									name: r.name,
									mentionable: r.mentionable,
									managed: r.managed,
									id: r.id,
									hoist: r.hoist,
									color: r.color
								})),
								emojis: g.emojis.map(e => ({
									roles: e.roles,
									require_colons: e.require_colons,
									name: e.name,
									managed: e.managed,
									id: e.id,
									available: true,
									animated: e.animated
								})),
								premium_tier: g.premiumTier,
								owner_id: g.ownerID,
								presences: g.members.map(m => ({
									user: {
										id: m.id
									},
									stats: m.status,
									game: m.game,
									client_status: m.clientStatus,
									activities: m.activities
								})),
								explicit_content_filter: g.explicitContentFilter,
								region: g.region,
								features: g.features,
								id: g.id,
								max_video_channel_users: g.maxVideoChannelUsers,
								description: g.description
							}
						});
						break;
					}*/

					case "stats": {
						this.sendMessage("COMMAND_RESPONSE", {
							type: "stats",
							data: {
								shards: this.client.shards.map(s => [s.id, {
									latency: s.latency,
									lastHeartbeatReceived: s.lastHeartbeatReceived,
									lastHeartbeatSent: s.lastHeartbeatSent,
									status: s.status,
									guilds: this.client.guilds.filter(g => g.shard.id === s.id).length,
									largeGuilds: this.client.guilds.filter(g => g.shard.id === s.id && g.large).length,
									channels: this.client.guilds.filter(g => g.shard.id === s.id).reduce((a, b) => a + b.channels.size, 0)
								}]),
								users: this.client.users.size,
								voiceConnections: this.client.voiceConnections.size,
								uptime: process.uptime() * 1000,
								memory: process.memoryUsage()
							}
						});
						break;
					}

					case "evalAtCluster": {
						if (this.ready) {
							const start = parseFloat(performance.now().toFixed(3));
							let result, error = false;
							try {
								result = await eval(msg.d.code);
							} catch (e) {
								error = true;
								result = {
									name: e.name,
									message: e.message,
									stack: e.stack
								};
							}
							const end = parseFloat(performance.now().toFixed(3));

							this.sendMessage("COMMAND_RESPONSE", {
								type: "evalAtCluster",
								ipc: true,
								callbackId: msg.d.callbackId,
								data: {
									result,
									error,
									time: parseFloat((end - start).toFixed(3))
								}
							});
						} else {
							this.sendMessage("COMMAND_RESPONSE", {
								type: "evalAtCluster",
								ipc: true,
								callbackId: msg.d.callbackId,
								data: {
									result: "NOT_READY",
									error: false,
									time: 0
								}
							});
						}
					}
				}
				break;
			}

			case "COMMAND_RESPONSE": {
				this.ipc.processMessage(msg.d);
				break;
			}
		}
	}
}
