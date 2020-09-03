/// <reference path="../@types/global.d.ts" />
import config from "../../config";
import { UpdateQuery, FindOneAndUpdateOption, WithId } from "mongodb";
import db, { mdb } from "../Database";
import Language, { Languages } from "../Language";
import Internal from "../Functions/Internal";

export type DBKeys = ConfigDataTypes<GuildConfig>;
export default class GuildConfig {
	id: string;
	settings: {
		prefix: string;
		lang: Languages;
		modlog: string | null;
		muteRole: string;
		deleteModCommands: boolean;
		commandImages: boolean;
		defaultYiffType: string;
		announceLevelUp: boolean;
	};
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
		type:
		"channelCreate" | "channelDelete" | "channelUpdate" |                         // channel
		"memberBan" | "memberUnban" | "memberJoin" | "memberLeave" | "memberUpdate" | // member
		"roleCreate" | "roleDelete" | "roleUpdate" |                                  // role
		"messageDelete" | "messageBulkDelete" | "messageEdit" |                       // message
		"presenceUpdate" | "userUpdate" |                                             // user
		"voiceJoin" | "voiceLeave" | "voiceSwitch" | "voiceStateUpdate" |             // voice
		"guildUpdate";
	}[];
	deletion: number | null;
	constructor(id: string, data: ConfigDataTypes<GuildConfig, "id">) {
		this.id = id;
		this.load.call(this, data);
	}

	private load(data: WithId<ConfigDataTypes<GuildConfig, "id">>) {
		if (data._id) delete data._id;
		Internal.goKeys(this, data, config.defaults.config.guild);
		return this;
	}

	async reload() {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = GuildConfig>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		const j = await mdb.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: ConfigEditTypes<GuildConfig, "id">) {
		const d = this;
		Internal.goKeys(d, data, config.defaults.config.guild);

		await mdb.collection("guilds").findOneAndUpdate({
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

	async getWarningId(userId: string) {
		return mdb.collection<Warning>("warnings").find({ guildId: this.id, userId }).toArray().then(v => v.sort((a, b) => b.id - a.id)?.[0]?.id + 1 || 1);
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

	async checkBlacklist() { return db.checkBl("guild", this.id); }
	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) { return db.addBl("guild", this.id, blame, blameId, reason, expire, report); }
}
