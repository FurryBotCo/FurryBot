/// <reference path="../@types/global.d.ts" />
import config from "../../config";
import { UpdateQuery, FindOneAndUpdateOption, WithId } from "mongodb";
import db, { mdb } from "../Database";
import { Languages } from "../Language";
import Utility from "../Functions/Utility";
import Logger from "../Logger";

export type DBKeys = ConfigDataTypes<GuildConfig>;
export default class GuildConfig {
	id: string;
	settings: {
		/** @deprecated */
		prefix: string;
		lang: Languages;
		muteRole: string;
		deleteModCommands: boolean;
		commandImages: boolean;
		defaultYiffType: string;
		announceLevelUp: boolean;
		ecoEmoji: string;
		slashCommandsEnabled: boolean;
	};
	prefix: string[];
	selfAssignableRoles: string[];
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
	tags: {
		creationDate: number;
		creationBlame: string;
		name: string;
		content: string;
	}[];
	logEvents: {
		channel: string;
		// plans to convert this to "filter"
		// with type: "blacklist" | "whitelist"
		ignore: {
			type: "user" | "channel" | "role";
			id: string;
		}[];
		type:
		"channelCreate" |
		"channelDelete" |
		"channelUpdate" |
		"memberBan" | // guildBanAdd
		"memberUnban" | // guildBanRemove
		"memberJoin" | // guildMemberAdd
		"memberLeave" | // guildMemberRemove
		"userKick" | // guildMemberRemove
		"memberUpdate" | // guildMemberUpdate
		"roleCreate" | // guildRoleCreate
		"roleDelete" | // guildRoleDelete
		"roleUpdate" | // guildRoleUpdate
		"messageDelete" |
		"messageDeleteBulk" |
		"messageEdit" | // messageUpdate
		"presenceUpdate" |
		"userUpdate" |
		"voiceJoin" | // voiceChannelJoin
		"voiceLeave" | // voiceChannelLeave
		"voiceSwitch" | // voiceChannelSwitch
		"voiceStateUpdate" |
		"guildUpdate" |
		"inviteCreate" |
		"inviteDelete";
	}[];
	auto: {
		id: string;
		type: "birb" | "bunny" | "cat" | "duck" |
		"fox" | "koala" | "otter" | "panda" |
		"snek" | "turtle" | "wah" | "wolf" |
		"fursuit" | "butts" | "bulge" |
		"yiff.gay" | "yiff.straight" | "yiff.lesbian" | "yiff.gynomorph";
		time: 5 | 10 | 15 | 30 | 60;
		channel: string;
	}[];
	modlog: {
		enabled: boolean;
		channel: string | null;
	};
	deletion: number | null;
	constructor(id: string, data: ConfigDataTypes<GuildConfig, "id">) {
		this.id = id;
		this.load.call(this, data);
	}

	private load(data: WithId<ConfigDataTypes<GuildConfig, "id">>) {
		if (data._id) delete data._id;
		delete data._id;
		Object.assign(this, Utility.mergeObjects(data, config.defaults.config.guild));
		return this;
	}

	async reload() {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = DBKeys>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		const j = await mdb.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: ConfigEditTypes<GuildConfig, "id">) {
		await mdb.collection("guilds").findOneAndUpdate({
			id: this.id
		}, {
			$set: Utility.mergeObjects(data, this)
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

	async getWarningId(userId: string) {
		return mdb.collection<Warning>("warnings").find({ guildId: this.id, userId }).toArray().then(v => v.sort((a, b) => b.id - a.id)?.[0]?.id + 1 || 1);
	}

	async getModlogId() {
		return (await mdb.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId: this.id }).count()) + 1;
	}

	async checkPremium(): Promise<PremiumGuildEntry> {
		const r = await mdb.collection("premium").find<PremiumGuildEntry>({ guildId: this.id }).toArray();
		if (!r || r.length === 0) return {
			type: "guild",
			guildId: this.id,
			user: null,
			active: false,
			activationDate: null
		};
		else return r[0];
	}

	async checkBlacklist() {
		return db.checkBl("guild", this.id);
	}
	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		return db.addBl("guild", this.id, blame, blameId, reason, expire, report);
	}

	async fix() {
		const obj: Parameters<GuildConfig["edit"]>[0] = Object.create(null);
		if (!Array.isArray(this.auto)) obj.auto = [];
		if (!Array.isArray(this.logEvents)) obj.logEvents = [];
		if (!Array.isArray(this.prefix)) obj.prefix = [
			this.settings.prefix || config.defaults.prefix
		];
		if (this.settings.prefix) {
			if (this.prefix && this.settings.prefix !== this.prefix[0]) obj.prefix = [
				this.settings.prefix
			];
			await this.mongoEdit({
				$unset: {
					"settings.prefix": true
				}
			});
			delete this.settings.prefix;
		}
		if (JSON.stringify(obj) !== "{}") {
			Logger.warn(["Database", "Guild"], `Fixed guild "${this.id}": ${JSON.stringify(obj)}`);
			await this.mongoEdit({
				$set: obj
			});
		}

		return this;
	}
}
