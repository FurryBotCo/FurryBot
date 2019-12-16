import config from "../../config";
import { mdb } from "../Database";

interface CommandConfigEntry {
	type: "command" | "category";
	selectionType: "channel" | "user" | "role" | "server";
	selection: string;
}

interface RegistrationQuestion {
	createdBy: string;
	question: string;
	options: {
		[q: string]: string;
	};
}

class GuildConfig {
	id: string;
	blacklist: {
		blacklisted: boolean;
		reason: string;
		blame: string;
	};
	premium: boolean;
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
		muteRole?: string;
		fResponse: boolean;
		commandImages: boolean;
		lang: string;
		prefix: string;
		deleteModCmds: boolean;
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
		"messageDelete" | "bulkMessageDelete" | "messageEdit" |                       // message
		"presenceUpdate" | "userUpdate" |                                             // user
		"voiceJoin" | "voiceLeave" | "voiceSwitch" | "voiceStateUpdate" |             // voice
		"guildUpdate"
		]: {
			enabled: boolean;
			channel?: string;
		}
	};
	constructor(id: string, data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.guildConfig;
		this._load.call(this, data);
	}

	private _load(data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		this.blacklist = ![undefined, null].includes(data.blacklist) ? {
			blacklisted: !!data.blacklist.blacklisted,
			reason: data.blacklist.reason || null,
			blame: data.blacklist.blame || null
		} : config.defaults.guildConfig.blacklist;
		this.premium = ![undefined, null].includes(data.premium) ? data.premium : config.defaults.guildConfig.premium;
		this.selfAssignableRoles = ![undefined, null].includes(data.selfAssignableRoles) ? data.selfAssignableRoles : config.defaults.guildConfig.selfAssignableRoles;
		this.music = ![undefined, null].includes(data.music) ? {
			volume: data.music.volume || 100,
			textChannel: data.music.textChannel || null,
			queue: data.music.queue || []
		} : config.defaults.guildConfig.music;
		this.settings = {
			nsfw: data.settings && data.settings.nsfw ? true : false,
			muteRole: data.settings && data.settings.muteRole ? data.settings.muteRole : null,
			fResponse: data.settings && data.settings.fResponse ? true : false,
			commandImages: data.settings && data.settings.commandImages ? true : false,
			lang: data.settings && data.settings.lang ? data.settings.lang : config.defaults.guildConfig.settings.lang,
			prefix: data.settings && data.settings.prefix ? data.settings.prefix : config.defaultPrefix,
			deleteModCmds: data.settings && data.settings.deleteModCmds ? data.settings.deleteModCmds : config.defaults.guildConfig.settings.deleteModCmds
		};
		this.snipe = data.snipe ? {
			delete: data.snipe.delete || config.defaults.guildConfig.snipe.delete,
			edit: data.snipe.edit || config.defaults.guildConfig.snipe.edit
		} : config.defaults.guildConfig.snipe;
		this.logEvents = {} as any;
		Object.keys(config.defaults.guildConfig.logEvents).map(k => data.logEvents && data.logEvents[k] ? this.logEvents[k] = data.logEvents[k] : this.logEvents[k] = config.defaults.guildConfig.logEvents[k]);
		return null;
	}

	async reload() {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(data: DeepPartial<Omit<{ [K in keyof GuildConfig]: GuildConfig[K]; }, "selfAssignableRoles">>) {
		const g = {
			blacklist: this.blacklist,
			premium: this.premium,
			music: this.music,
			settings: this.settings,
			snipe: this.snipe,
			logEvents: this.logEvents
		};

		function replaceArray(keys: string[], check: any, update: any) {
			return keys.map(k => typeof check[k] !== "undefined" ? update[k] = check[k] : null);
		}

		if (typeof data.blacklist !== "undefined") replaceArray(["blacklisted", "reason", "blame"], data.blacklist, g.blacklist);

		if (typeof data.premium !== "undefined") g.premium = data.premium;

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
}

export default GuildConfig;
