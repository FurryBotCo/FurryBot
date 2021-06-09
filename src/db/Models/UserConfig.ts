import { AnySocial } from "../../util/@types/Socials";
import config from "../../config";
import FurryBot from "../../main";
import db from "..";
import { UserConfig as UC } from "core";
import { DataTypes, EditTypes } from "core/src/@types/db";
import Logger from "logger";
import { AnyObject } from "utilities";
import { MatchKeysAndValues, UpdateQuery } from "mongodb";

// @TODO afk servers array
export type DBKeys = DataTypes<UserConfig>;
export default class UserConfig extends UC<typeof db> {
	afk: {
		servers: Array<{
			active: boolean;
			id: string;
			since: number;
		}>;
		global: {
			active: boolean;
			since: number;
		};
	};
	socials: Array<AnySocial>;
	booster: boolean;
	levels: {
		[k: string]: number;
	};
	marriage: string | null;
	deletion: number | null;
	donations: {
		"ko-fi": {
			name: string | null;
		};
		"totalMonths": number;
		"activationTime": number | null;
	};
	dmResponse: boolean;
	reminders: Array<{
		channel: string;
		time: number;
		end: string;
		reason: string;
	}>;
	constructor(id: string, data: DataTypes<UserConfig, "id">) {
		super(id, config.defaults.config.user, db);
		super.setRef(this);
		super.load(data);
	}

	async fix() {
		const obj = Object.create(null) as EditTypes<UserConfig, "id"> & AnyObject ;
		if (typeof this.booster !== "boolean") obj.booster = false;
		if (!Array.isArray(this.afk.servers)) obj["afk.servers"] = [];
		if (JSON.stringify(obj) !== "{}") {
			Logger.warn(["Database", "User"], `Fixed user "${this.id}": ${JSON.stringify(obj)}`);
			await this.edit(obj);
		}

		return this;
	}

	async checkPremium(checkBoost = false): Promise<{
		remainingMonths: number | "BOOSTER";
		activationTime: number | null;
		active: boolean;
	}> {
		if (checkBoost && this.booster) return {
			remainingMonths: "BOOSTER",
			activationTime: null,
			active: true
		};

		if (!this.donations || !this.donations.activationTime || this.donations.totalMonths < 1) return {
			remainingMonths: 0,
			activationTime: null,
			active: false
		};
		// 30.42 days
		const d = 2.62829e+9;
		if ((this.donations.activationTime + d) > Date.now()) {
			if (this.donations.totalMonths === 1) {
				await this.edit({
					"donations.totalMonths": 0
				});
				return {
					remainingMonths: 0,
					activationTime: null,
					active: false
				};
			} else {
				await this.edit({
					"donations.totalMonths": this.donations.totalMonths - 1,
					"donations.activationTime": Date.now()
				});
			}
		}

		return {
			remainingMonths: this.donations.totalMonths,
			activationTime: this.donations.activationTime,
			active: true
		};
	}

	async getBadges(client: FurryBot) {
		return client.b.getUserBadges(this.id);
	}

	async checkBlacklist() {
		return this.db.checkBl("user", this.id);
	}
	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		return this.db.addBl("user", this.id, blame, blameId, reason, expire, report);
	}

	async checkVote() {
		return this.db.checkVote(this.id);
	}

	getLevel(g: string) {
		// because ts is being screwy
		return ((this.levels && this.levels[g]) ?? 0) as unknown as number;
	}

	override async edit(d: MatchKeysAndValues<EditTypes<UserConfig, "id">>) {
		return super.edit(d);
	}

	override async mongoEdit(d: UpdateQuery<EditTypes<UserConfig, "id">>) {
		return super.mongoEdit(d);
	}
}
