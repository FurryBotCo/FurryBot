import config from "../../config";
import { mdb } from "../Database";
import { DeepPartial } from "../../util/@types/Misc";

class GuildConfig {
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
	auto: (
		GlobalTypes.Auto.Yiff<"gay" | "straight" | "lesbian" | "dickgirl"> |
		GlobalTypes.Auto.Animals<"bird" | "bunny" | "cat" | "dog" | "duck" | "fox" | "otter" | "panda" | "snek" | "turtle" | "wolf">
	)[];
	disable: {
		server: string[];
		channels: {
			[k: string]: string[];
		};
	};
	constructor(id: string, data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.guildConfig;
		this._load.call(this, data);
	}

	private _load(data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		this.selfAssignableRoles = ![undefined, null].includes(data.selfAssignableRoles) ? data.selfAssignableRoles : config.defaults.guildConfig.selfAssignableRoles;
		this.music = ![undefined, null].includes(data.music) ? {
			volume: data.music.volume || 100,
			textChannel: data.music.textChannel || null,
			queue: data.music.queue || []
		} : config.defaults.guildConfig.music;
		this.settings = Object.keys(config.defaults.guildConfig.settings).map(k => ({ [k]: data.settings && ![undefined, null].includes(data.settings[k]) ? data.settings[k] : config.defaults.guildConfig.settings[k] })).reduce((a, b) => ({ ...a, ...b })) as any;
		this.snipe = data.snipe ? {
			delete: data.snipe.delete || config.defaults.guildConfig.snipe.delete,
			edit: data.snipe.edit || config.defaults.guildConfig.snipe.edit
		} : config.defaults.guildConfig.snipe;
		this.logEvents = {} as any;
		Object.keys(config.defaults.guildConfig.logEvents).map(k => data.logEvents && data.logEvents[k] ? this.logEvents[k] = data.logEvents[k] : this.logEvents[k] = config.defaults.guildConfig.logEvents[k]);
		this.tags = data.tags ? data.tags : config.defaults.guildConfig.tags;
		this.auto = ![undefined, null].includes(data.auto) ? data.auto : config.defaults.guildConfig.auto;
		this.disable = data.disable ? {
			server: data.disable.server || [],
			channels: data.disable.channels || {}
		} : config.defaults.guildConfig.disable;
		return null;
	}

	async reload() {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(data: DeepPartial<Omit<{ [K in keyof GuildConfig]: GuildConfig[K]; }, "selfAssignableRoles" | "autoyiff">>) {
		const g = {
			music: this.music,
			settings: this.settings,
			snipe: this.snipe,
			logEvents: this.logEvents,
			tags: {
				...this.tags,
				...(data.tags && Object.keys(data).length > 0 ? data.tags : {})
			}
		};

		Object.keys(g.tags).map(t => g.tags[t] === null ? delete g.tags[t] : null);

		function replaceArray(keys: string[], check: any, update: any) {
			return keys.map(k => typeof check[k] !== "undefined" ? update[k] = check[k] : null);
		}

		if (typeof data.music !== "undefined") replaceArray(["volume", "textChannel"], data.music, g.music);

		if (typeof data.settings !== "undefined") replaceArray(Object.keys(config.defaults.guildConfig.settings), data.settings, g.settings);

		if (typeof data.snipe !== "undefined") {
			if (typeof data.snipe.delete !== "undefined") g.snipe.delete = { ...g.snipe.delete, ...data.snipe.delete };
			if (typeof data.snipe.edit !== "undefined") g.snipe.edit = { ...g.snipe.edit, ...data.snipe.edit };
		}

		if (typeof data.logEvents !== "undefined") replaceArray(Object.keys(config.defaults.guildConfig.logEvents), data.logEvents, g.logEvents);

		try {
			await mdb.collection("guilds").findOneAndUpdate({
				id: this.id
			}, {
				$set: g
			});
		} catch (e) {
			await mdb.collection("guilds").insertOne({ id: this.id, ...g });
		}

		// auto reload on edit
		return this.reload();
	}

	async delete() {
		await mdb.collection("guilds").findOneAndDelete({ id: this.id });
	}

	async reset() {
		// await this.delete();
		// awaitz mdb.collection("guilds").insertOne(Object.assign({}, config, { id: this.id }));
		await this.edit(config.defaults.guildConfig);
		await this._load(config.defaults.guildConfig);
		return this;
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

export default GuildConfig;
