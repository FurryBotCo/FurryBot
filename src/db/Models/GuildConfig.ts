import config from "../../config";
import db from "..";
import { VALID_LANGUAGES } from "../../main";
import { ModLogEntry, Warning } from "../../util/@types/Database";
import { GuildConfig as GC, ConfigDataTypes, ConfigEditTypes } from "core";
import Logger from "logger";
import { WithId } from "mongodb";

export type DBKeys = ConfigDataTypes<GuildConfig>;
export default class GuildConfig extends GC<VALID_LANGUAGES> {
	settings: {
		/** @deprecated */
		prefix?: string;
		lang: VALID_LANGUAGES;
		muteRole: string;
		deleteModCommands: boolean;
		commandImages: boolean;
		defaultYiffType: string;
		announceLevelUp: boolean;
		ecoEmoji: string;
		slashCommandsEnabled: boolean;
	};
	selfAssignableRoles: Array<string>;
	disable: Array<({
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
	})>;
	tags: Array<{
		creationDate: number;
		creationBlame: string;
		name: string;
		content: string;
	}>;
	logEvents: Array<{
		channel: string;
		// plans to convert this to "filter"
		// with type: "blacklist" | "whitelist"
		ignore: Array<{
			type: "user" | "channel" | "role";
			id: string;
		}>;
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
	}>;
	auto: Array<{
		id: string;
		type: "birb" | "bunny" | "cat" | "duck" |
		"fox" | "koala" | "otter" | "panda" |
		"snek" | "turtle" | "wah" | "wolf" |
		"fursuit" | "butts" | "bulge" |
		"yiff.gay" | "yiff.straight" | "yiff.lesbian" | "yiff.gynomorph";
		time: 5 | 10 | 15 | 30 | 60;
		webhook: {
			id: string;
			token: string;
			channelId: string;
		};
	}>;
	modlog: {
		enabled: boolean;
		/** @deprecated */
		channel: string | null;
		webhook: Record<"id" | "token" | "channelId", string> | null;
	};
	levelRoles: Array<{
		role: string;
		level: number;
	}>;
	deletion: number | null;
	constructor(id: string, data: WithId<ConfigDataTypes<GuildConfig, "id">>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore -- fuck off
		super(id, data, config.defaults.config.guild, db);
	}

	/* eslint-disable deprecation/deprecation */
	override async fix() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const obj: ConfigEditTypes<GuildConfig, "id"> = Object.create(null);
		if (this.modlog !== undefined){
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore -- dot notation for mongodb
			if (typeof this.modlog.webhook === "undefined") obj["modlog.webhook"] = null;
		} else obj.modlog = {
			enabled: false,
			webhook: null
		};
		if (!Array.isArray(this.auto)) obj.auto = [];
		if (!Array.isArray(this.logEvents)) obj.logEvents = [];
		if (!Array.isArray(this.disable)) obj.disable = [];
		if (!Array.isArray(this.tags)) obj.tags = [];
		if (!Array.isArray(this.levelRoles)) obj.levelRoles = [];
		if (!Array.isArray(this.prefix)) obj.prefix = [
			this.settings.prefix || config.defaults.prefix
		];
		if (this.prefix?.length === 0) obj.prefix = [
			this.settings.prefix || config.defaults.prefix
		];
		// @FIXME send a notice inside the AutoPosting service & remove channel there
		/* const v = JSON.parse(JSON.stringify(this.auto)) as GuildConfig["auto"];
		for (const a of v) if ("channel" in a) {
			if ((a as typeof a & { channel: null; }).channel === null) delete (v[v.indexOf(a)] as typeof a & { channel?: null; }).channel;
			else v.splice(this.auto.indexOf(a), 1);
		}
		if (JSON.stringify(this.auto) !== JSON.stringify(v)) obj.auto = v; */
		if (this.settings.prefix) {
			if (this.prefix && this.settings.prefix !== this.prefix[0]) obj.prefix = [
				this.settings.prefix
			];
			await this.mongoEdit({
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				$unset: {
					"settings.prefix": true
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any
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
	/* eslint-enable deprecation/deprecation */

	async checkBlacklist() {
		return db.checkBl("guild", this.id);
	}

	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		return db.addBl("guild", this.id, blame, blameId, reason, expire, report);
	}

	async getWarningId(userId: string) {
		return db.collection<Warning>("warnings").find({ guildId: this.id, userId }).toArray().then(v => v.sort((a, b) => b.id - a.id)?.[0]?.id + 1 || 1);
	}

	async getModlogId() {
		return (await db.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId: this.id }).count()) + 1;
	}
}
