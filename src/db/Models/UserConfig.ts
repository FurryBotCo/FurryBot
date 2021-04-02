import { AnySocial } from "../../util/@types/Socials";
import config from "../../config";
import FurryBot from "../../main";
import db from "..";
import { UserConfig as UC } from "core";
import { ConfigDataTypes, ConfigEditTypes } from "core/src/@types/db";
import Logger from "logger";
import { WithId } from "mongodb";

export type DBKeys = ConfigDataTypes<UserConfig>;
export default class UserConfig extends UC {
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
	constructor(id: string, data: WithId<ConfigDataTypes<UserConfig, "id">>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore -- fuck off
		super(id, data, config.defaults.config.user, db);
	}

	override async fix() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const obj: ConfigEditTypes<UserConfig, "id"> = Object.create(null);
		if (typeof this.booster !== "boolean") obj.booster = false;
		if (JSON.stringify(obj) !== "{}") {
			Logger.warn(["Database", "User"], `Fixed user "${this.id}": ${JSON.stringify(obj)}`);
			await this.edit(obj);
		}

		return this;
	}

	override async checkPremium(checkBoost = false): Promise<{
		remainingMonths: number | "BOOSTER";
		activationTime: number | null;
		active: boolean;
	}> {
		if (checkBoost && this.booster) return {
			remainingMonths: "BOOSTER",
			activationTime: null,
			active: true
		};

		if (!this.donations.activationTime || this.donations.totalMonths < 1) return {
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
		return db.checkBl("user", this.id);
	}
	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		return db.addBl("user", this.id, blame, blameId, reason, expire, report);
	}

	async checkVote() {
		return db.checkVote(this.id);
	}

	getLevel(g: string) {
		// because ts is being screwy
		return ((this.levels && this.levels[g]) ?? 0) as unknown as number;
	}
}
