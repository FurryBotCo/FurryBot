import config from "../../config";
import { VALID_LANGUAGES } from "../../main";
import db from "..";
import { GuildConfig as GC, DataTypes, EditTypes } from "core";
import Logger from "logger";
import { MatchKeysAndValues, UpdateQuery } from "mongodb";

export type DBKeys = DataTypes<GuildConfig>;
export default class GuildConfig extends GC<VALID_LANGUAGES, typeof db> {
	declare settings: {
		/** @deprecated */
		prefix?: string;
		lang: VALID_LANGUAGES;
		muteRole: string | null;
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
		type: typeof config["logTypes"][number];
	}>;
	auto: Array<{
		id: string;
		type: typeof config["autoTypes"][number];
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
	constructor(id: string, data: DataTypes<GuildConfig, "id">) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore -- fuck off
		super(id, config.defaults.config.guild, db);
		super.setRef(this);
		super.load(data);
	}

	/* eslint-disable deprecation/deprecation */
	async fix() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const obj: EditTypes<GuildConfig, "id"> = Object.create(null);
		if (this.modlog !== undefined){
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore -- dot notation for mongodb
			if (typeof this.modlog.webhook === "undefined") obj.modlog = { webhook: null };
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
		if (!this.settings.lang) obj.settings = {
			lang: config.defaults.config.guild.settings.lang as "en"
		};
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
			await this.edit(obj);
		}
		return this;
	}
	/* eslint-enable deprecation/deprecation */

	async checkBlacklist() {
		return this.db.checkBl("guild", this.id);
	}

	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		return this.db.addBl("guild", this.id, blame, blameId, reason, expire, report);
	}

	async getWarningId(userId: string) {
		return this.db.collection("warnings").find({ guildId: this.id, userId }).toArray().then(v => v.sort((a, b) => b.warningId - a.warningId)?.[0]?.warningId + 1 || 1);
	}

	async getModlogId() {
		return this.db.collection("modlog").find({ guildId: this.id }).toArray().then(v => v.length + 1);
	}

	override async edit(d: MatchKeysAndValues<EditTypes<GuildConfig, "id">>) {
		return super.edit(d);
	}

	override async mongoEdit(d: UpdateQuery<EditTypes<GuildConfig, "id">>) {
		return super.mongoEdit(d);
	}
}
