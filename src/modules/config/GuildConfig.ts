import config from "../../config";
import { mdb } from "../Database";
import { DeepPartial } from "../../util/@types/Misc";
import _ from "lodash";
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
	disable: {
		server: string[];
		channels: {
			[k: string]: string[];
		};
	};
	deletion?: number;

	constructor(id: string, data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.config.guild;
		this.load.call(this, data);
	}

	async load(data: DeepPartial<{ [K in keyof GuildConfig]: GuildConfig[K]; }>) {
		_.merge({ ...config.defaults.config.guild }, data);
		_.merge(this, data);
		// temporary fix for missing settings properties
		Object.keys(config.defaults.config.guild.settings).map(p => typeof this.settings[p] === "undefined" ? this.settings[p] = config.defaults.config.guild.settings[p] : null);
	}

	async reload() {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async edit(data: DeepPartial<Omit<{ [K in keyof GuildConfig]: GuildConfig[K]; }, "selfAssignableRoles">>) {
		const d = this;
		_.merge(d, data);

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
