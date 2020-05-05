import config from "../../config";
import { mdb } from "../Database";
import { DeepPartial } from "../../util/@types/Misc";
import _ from "lodash";
import rClient from "../../util/Redis";
import { UpdateQuery, FindOneAndUpdateOption } from "mongodb";

interface Warning {
	blame: string;
	gid: string;
	reason: string;
	timestamp: Date;
	wid: number;
}

export default class UserConfig {
	id: string;
	marriage: {
		married: boolean;
		partner: string;
	};
	warnings: Warning[];
	bal: number;
	tips: boolean;
	dmActive: boolean;
	preferences: {
		mention: boolean;
	};
	levels: {
		[k: string]: number;
	};
	deletion?: number;

	constructor(id: string, data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.config.user;
		this.load.call(this, data);
	}

	async load(data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		/**
		 * @param {*} a - the current class
		 * @param {*} b - the provided data
		 * @param {*} c - the default data
		 */
		const goKeys = (a, b, c) => {
			const obj = Object.keys(c).length === 0 ? b : c;
			return Object.keys(obj).map(k => {
				if (typeof c[k] === "object" && c[k] !== null) {
					if (c[k] instanceof Array) a[k] = [undefined, null, ""].includes(b[k]) ? c[k] : b[k];
					else {
						if ([undefined, null, ""].includes(a[k])) a[k] = {};
						if (![undefined, null, ""].includes(b[k])) return goKeys(a[k], b[k], c[k]);
					}
				} else return a[k] = [undefined].includes(b[k]) ? c[k] : b[k];
			});
		};

		goKeys(this, data, config.defaults.config.user);
	}

	async deleteCache() {
		await rClient.DEL(`${config.beta ? "beta" : "prod"}:db:uConfig:${this.id}`);
	}

	async reload() {
		await this.deleteCache();
		const r = await mdb.collection("users").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = any>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption) {
		await this.deleteCache();
		return mdb.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
	}

	async edit(data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		await this.deleteCache();
		const d = this;
		/**
		 *
		 * @param {*} a - the data to update
		 * @param {*} b - the provided data
		 */
		const goKeys = (a, b) => {
			return Object.keys(b).map(k => {
				if (typeof b[k] === "object" && b[k] !== null) {
					if (b[k] instanceof Array) a[k] = [undefined, null, ""].includes(b[k]) ? a[k] : b[k];
					else {
						if ([undefined, null, ""].includes(a[k])) a[k] = {};
						if ([undefined, null, ""].includes(b[k])) b[k] = {};
						return goKeys(a[k], b[k]);
					}
				} else return a[k] = [undefined, null, ""].includes(b[k]) ? a[k] : b[k];
			});
		};

		goKeys(d, data);

		const e = await mdb.collection("users").findOne({
			id: this.id
		});

		if (!e) await mdb.collection("users").insertOne({
			id: this.id, ...d
		});
		else await mdb.collection("users").findOneAndUpdate({
			id: this.id
		}, {
			$set: d
		});

		return this.reload();
	}

	async create() {
		await this.deleteCache();
		const e = await mdb.collection("users").findOne({
			id: this.id
		});
		if (!e) await mdb.collection("users").insertOne({
			id: this.id,
			...config.defaults.config.user
		});

		return this;
	}

	async delete() {
		await this.deleteCache();
		await mdb.collection("users").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	async premiumCheck(): Promise<GlobalTypes.PremiumUserEntry> {
		const r = await mdb.collection("premium").find<GlobalTypes.PremiumUserEntry>({ userId: this.id }).toArray();
		if (!r || r.length === 0) return {
			type: "user",
			userId: this.id,
			amount: 0,
			active: false,
			activationDate: null,
			patronId: null
		};
		else return r[0];
	}

	getLevel(g: string) {
		return this.levels && this.levels[g] ? this.levels[g] : 0;
	}
}
