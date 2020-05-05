import config from "../../config";
import { mdb } from "../Database";
import { DeepPartial } from "../../util/@types/Misc";
import _ from "lodash";
import Logger from "../../util/LoggerV8";
import rClient from "../../util/Redis";
import { UpdateQuery, FindOneAndUpdateOption } from "mongodb";
export default class GuildConfig {
	id: string;
	selfAssignableRoles: string[];
	music: {
		volume: number;
		textChannel: string;
		queue: {
			link: string;
			channel: string;
			length: number;
			title: string;
			blame: string;
		}[];
	};
	settings: {
		announceLevelUp: boolean;
		nsfw: boolean;
		defaultYiff: string;
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
		[k in
		"channelCreate" | "channelDelete" | "channelUpdate" |                         // channel
		"memberBan" | "memberUnban" | "memberJoin" | "memberLeave" | "memberUpdate" | // member
		"roleCreate" | "roleDelete" | "roleUpdate" |                                  // role
		"messageDelete" | "messageBulkDelete" | "messageEdit" |                       // message
		"presenceUpdate" | "userUpdate" |                                             // user
		"voiceJoin" | "voiceLeave" | "voiceSwitch" | "voiceStateUpdate" |             // voice
		"guildUpdate"
		]: {
			enabled: boolean;
			channel?: string;
		}
	};
	tags: {
		[k: string]: string;
	};
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
	}

	async deleteCache() {
		await rClient.DEL(`${config.beta ? "beta" : "prod"}:db:gConfig:${this.id}`);
	}

	async reload() {
		await this.deleteCache();
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = any>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption) {
		await this.deleteCache();
		return mdb.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
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
}
