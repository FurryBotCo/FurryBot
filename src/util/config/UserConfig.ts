/// <reference path="../@types/global.d.ts" />
import config from "../../config";
import { UpdateQuery, FindOneAndUpdateOption, WithId } from "mongodb";
import db, { mdb } from "../Database";
import Internal from "../Functions/Internal";

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
		totalMonths: number;
	};
	eco: Economy.EcoUser;
	constructor(id: string, data: ConfigDataTypes<UserConfig, "id">) {
		this.id = id;
		this.load.call(this, data);
	}

	private load(data: WithId<ConfigDataTypes<UserConfig, "id">>) {
		if (data?._id) delete data._id;
		Internal.goKeys(this, data, config.defaults.config.user);
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
		const d = this;
		Internal.goKeys(d, data, config.defaults.config.user);

		await mdb.collection("users").findOneAndUpdate({
			id: this.id
		}, {
			$set: d
		});

		return this.reload();
	}

	async checkPremium(): Promise<PremiumUserEntry> {
		const r = await mdb.collection("premium").find<PremiumUserEntry>({ userId: this.id }).toArray();
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
		// because ts is being screwy
		return ((this.levels && this.levels[g]) ?? 0) as unknown as number;
	}

	async checkBlacklist() { return db.checkBl("user", this.id); }
	async addBlacklist(blame: string, blameId: string, reason?: string, expire?: number, report?: string) { return db.addBl("user", this.id, blame, blameId, reason, expire, report); }

	async checkVote() { return db.checkVote(this.id); }
}
