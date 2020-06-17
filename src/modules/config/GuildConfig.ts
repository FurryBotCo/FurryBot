/// <reference path="../../util/@types/global.d.ts" />
import config from "../../config";
import db, { mdb } from "../Database";
import Logger from "../../util/LoggerV10";
import { UpdateQuery, FindOneAndUpdateOption } from "mongodb";
import { Redis } from "../External";

// @TODO fix props on old entries
export default class GuildConfig {
	id: string;
	selfAssignableRoles: string[];
	settings: {
		announceLevelUp: boolean;
		nsfw: boolean;
		defaultYiff: string;
		djRole: string;
		snipeCommand: boolean;
		muteRole?: string;
		fResponse: boolean;
		commandImages: boolean;
		lang: string;
		prefix: string;
		deleteModCmds: boolean;
		ecoEmoji: string;
		modlog?: string;
		joinEnabled: boolean;
		joinMessage: string;
		joinChannel?: string;
		leaveEnabled: boolean;
		leaveMessage: string;
		leaveChannel?: string;
		welcomeDeleteTime: number;
	};
	snipe: {
		edit: {
			[k: string]: {
				authorId: string;
				content: string;
				oldContent: string;
				time: number;
			};
		};
		delete: {
			[k: string]: {
				authorId: string;
				content: string;
				time: number;
			};
		};
	};
	logEvents: {
		channel: string;
		type:
		"channelCreate" | "channelDelete" | "channelUpdate" |                         // channel
		"memberBan" | "memberUnban" | "memberJoin" | "memberLeave" | "memberUpdate" | // member
		"roleCreate" | "roleDelete" | "roleUpdate" |                                  // role
		"messageDelete" | "messageBulkDelete" | "messageEdit" |                       // message
		"presenceUpdate" | "userUpdate" |                                             // user
		"voiceJoin" | "voiceLeave" | "voiceSwitch" | "voiceStateUpdate" |             // voice
		"guildUpdate";
	}[];
	tags: {
		creationDate: number;
		creationBlame: string;
		name: string;
		content: string;
	}[];
	auto: {}[];
	disable: (({
		type: "channel" | "role" | "user";
		id: string;
	} | {
		type: "server";
	}) & ({
		command: string;
	} | {
		category: string;
	} | {
		all: true;
	}))[];
	deletion?: number;

	constructor(id: string, data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.config.guild;
		this.load.call(this, data);
	}

	async load(data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		/**
		 * @param {*} a - the current class
		 * @param {*} b - the provided data
		 * @param {*} c - the default data
		 */
		const goKeys = (a, b, c) => {
			const obj = Object.keys(c).length === 0 ? b : c;
			return Object.keys(obj).map(k => {
				if (typeof c[k] === "object" && c[k] !== null) {
					if (c[k] instanceof Array) a[k] = [undefined, null, ""].includes(b[k]) ? c[k] : b[k];
					else {
						if ([undefined, null, ""].includes(a[k])) a[k] = {};
						if (![undefined, null, ""].includes(b[k])) return goKeys(a[k], b[k], c[k]);
					}
				} else return a[k] = [undefined].includes(b[k]) ? c[k] : b[k];
			});
		};

		goKeys(this, data, config.defaults.config.guild);
		// breaking changes
		if (!(this.logEvents instanceof Array)) await this.mongoEdit({
			$set: {
				logEvents: Object.keys(this.logEvents).map(l => ({
					type: l,
					channel: this.logEvents[l]
				}))
			}
		});
		if (!(this.tags instanceof Array)) await this.mongoEdit({
			$set: {
				tags: Object.keys(this.tags).map(t => ({
					creationDate: 0,
					creationBlame: null,
					name: t,
					content: this.tags[t]
				}))
			}
		});
	}

	async deleteCache() {
		await Redis.DEL(`${config.beta ? "beta" : "prod"}:db:gConfig:${this.id}`);
	}

	async reload() {
		await this.deleteCache();
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = GuildConfig>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption) {
		await this.deleteCache();
		const j = await mdb.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: DeepPartial<Omit<{ [K in keyof GuildConfig]: GuildConfig[K]; }, "selfAssignableRoles">>) {
		await this.deleteCache();
		const d = this;

		/**
		 *
		 * @param {*} a - the data to update
		 * @param {*} b - the provided data
		 */
		const goKeys = (a, b) => {
			return Object.keys(b).map(k => {
				if (typeof b[k] === "object" && b[k] !== null) {
					if (b[k] instanceof Array) a[k] = [undefined, null, ""].includes(b[k]) ? a[k] : b[k];
					else {
						if ([undefined, null, ""].includes(a[k])) a[k] = {};
						if (![undefined, null, ""].includes(b[k])) return goKeys(a[k], b[k]);
					}
				} else return a[k] = [undefined, null, ""].includes(b[k]) ? a[k] : b[k];
			});
		};

		goKeys(d, data);

		const e = await mdb.collection("guilds").findOne({
			id: this.id
		});

		if (!e) await mdb.collection("guilds").insertOne({
			id: this.id, ...d
		});
		else await mdb.collection("guilds").findOneAndUpdate({
			id: this.id
		}, {
			$set: d
		});

		return this.reload();
	}

	async create() {
		await this.deleteCache();
		const e = await mdb.collection("guilds").findOne({
			id: this.id
		});
		if (!e) await mdb.collection("guilds").insertOne({
			id: this.id,
			...config.defaults.config.guild
		});

		return this;
	}

	async delete() {
		await this.deleteCache();
		await mdb.collection("guilds").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	async premiumCheck(): Promise<GlobalTypes.PremiumGuildEntry> {
		const r = await mdb.collection("premium").find<GlobalTypes.PremiumGuildEntry>({ guildId: this.id }).toArray();
		if (!r || r.length === 0) return {
			type: "guild",
			guildId: this.id,
			user: null,
			active: false,
			activationDate: null
		};
		else return r[0];
	}

	async checkBlacklist() { return db.checkBl("guild", this.id); }
	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) { return db.addBl("guild", this.id, blame, blameId, reason, expire, report); }
}
