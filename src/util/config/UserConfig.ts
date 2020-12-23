/// <reference path="../@types/global.d.ts" />
/// <reference path="../@types/Economy.d.ts" />
import config from "../../config";
import { UpdateQuery, FindOneAndUpdateOption, WithId } from "mongodb";
import db, { mdb } from "../Database";
import Utility from "../Functions/Utility";
import Logger from "../Logger";

export type DBKeys = ConfigDataTypes<UserConfig>;
export default class UserConfig {
	id: string;
	afk: {
		servers: {
			active: boolean;
			id: string;
			since: number;
		}[];
		global: {
			active: boolean;
			since: number;
		};
	};
	socials: Socials.AnySocial[];
	booster: {
		active: boolean;
		expiry: string;
	};
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
	eco: Economy.EcoUser;
	constructor(id: string, data: ConfigDataTypes<UserConfig, "id">) {
		this.id = id;
		this.load.call(this, data);
	}

	private load(data: WithId<ConfigDataTypes<UserConfig, "id">>) {
		if (data?._id) delete data._id;
		Object.assign(this, Utility.mergeObjects(data, config.defaults.config.user));
		return this;
	}

	async reload() {
		const r = await mdb.collection("users").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = UserConfig>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		const j = await mdb.collection<T>("users").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: ConfigEditTypes<UserConfig, "id">) {
		await mdb.collection("users").findOneAndUpdate({
			id: this.id
		}, {
			$set: Utility.mergeObjects(data, this)
		});

		return this.reload();
	}

	async checkPremium(): Promise<{
		remainingMonths: number;
		activationTime: number | null;
		active: boolean;
	}> {
		if (!this.donations.activationTime || this.donations.totalMonths < 1) return {
			remainingMonths: 0,
			activationTime: null,
			active: false
		};
		// 30.42 days
		const d = 2.62829e+9;
		if ((this.donations.activationTime + d) > Date.now()) {
			if (this.donations.totalMonths === 1) {
				await this.mongoEdit({
					$set: {
						"donations.totalMonths": 0
					}
				});
				return {
					remainingMonths: 0,
					activationTime: null,
					active: false
				};
			} else {
				await this.mongoEdit({
					$set: {
						"donations.totalMonths": this.donations.totalMonths - 1,
						"donations.activationTime": Date.now()
					}
				});
			}
		}

		return {
			remainingMonths: this.donations.totalMonths,
			activationTime: this.donations.activationTime,
			active: true
		};
	}

	getLevel(g: string) {
		// because ts is being screwy
		return ((this.levels && this.levels[g]) ?? 0) as unknown as number;
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

	async checkBooster() {
		if (!this.booster.active) return {
			active: false,
			expired: false,
			expiry: null
		};

		if (!this.booster.expiry) {
			await this.edit({
				booster: {
					active: false,
					expiry: null
				}
			});

			return {
				active: false,
				expired: true,
				expiry: null
			};
		}

		const e = new Date(this.booster.expiry).getTime();
		const d = new Date().setHours(0, 0, 0);

		if (e < d) {
			await this.edit({
				booster: {
					active: false,
					expiry: null
				}
			});

			return {
				active: false,
				expired: true,
				expiry: null
			};
		}
		return {
			active: true,
			expired: false,
			expiry: this.booster.expiry
		};
	}

	async fix() {
		const obj: Parameters<UserConfig["edit"]>[0] = Object.create(null);
		if (JSON.stringify(obj) !== "{}") {
			console.log(JSON.stringify(obj), true);
			await this.edit(obj);
			Logger.warn(["Database", "User"], `Fixed user "${this.id}": ${JSON.stringify(obj)}`);
		}

		return this;
	}
}
