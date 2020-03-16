import config from "../../config";
import { mdb } from "../Database";
import { DeepPartial } from "../../util/@types/Misc";

// I considered adding votes onto user objects, bot tracking them separately will work out
// better in the long run.

interface Warning {
	blame: string;
	gid: string;
	reason: string;
	timestamp: Date;
	wid: number;
}

class UserConfig {
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
	// voteCount: number;
	// lastVote: number;
	constructor(id: string, data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		this.id = id;
		if (!data) data = config.defaults.userConfig;
		this._load.call(this, data);
	}

	_load(data: DeepPartial<{ [K in keyof UserConfig]: UserConfig[K]; }>) {
		this.marriage = ![undefined, null].includes(data.marriage) ? {
			married: !!data.marriage.married,
			partner: data.marriage.partner || null
		} : config.defaults.userConfig.marriage;
		this.warnings = ![undefined, null].includes(data.warnings) ? data.warnings : config.defaults.userConfig.warnings;
		this.bal = ![undefined, null].includes(data.bal) ? data.bal : config.defaults.userConfig.bal;
		this.tips = ![undefined, null].includes(data.tips) ? data.tips : config.defaults.userConfig.tips;
		this.dmActive = ![undefined, null].includes(data.dmActive) ? data.dmActive : config.defaults.userConfig.dmActive;
		this.preferences = ![undefined, null].includes(data.preferences) ? {
			mention: !!data.preferences.mention
		} : config.defaults.userConfig.preferences;
		// this.voteCount = ![undefined, null].includes(data.voteCount) ? data.voteCount : config.voteCount;
		// this.lastVote = ![undefined, null].includes(data.lastVote) ? data.lastVote : config.lastVote;
		this.levels = ![undefined, null].includes(data.levels) ? data.levels : config.defaults.userConfig.levels;
		return null;
	}

	async reload() {
		const r = await mdb.collection("users").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(data: DeepPartial<Omit<{ [K in keyof UserConfig]: UserConfig[K]; }, "warnings">>) {
		const u = {
			marriage: this.marriage,
			id: this.id,
			bal: this.bal,
			tips: this.tips,
			dmActive: this.dmActive,
			preferences: this.preferences,
			levels: this.levels
		};

		if (typeof data.marriage !== "undefined") {
			if (typeof data.marriage.married !== "undefined") u.marriage.married = data.marriage.married;
			if (typeof data.marriage.partner !== "undefined") u.marriage.partner = data.marriage.partner;
		}

		if (typeof data.bal !== "undefined") u.bal = data.bal;
		if (typeof data.tips !== "undefined") u.tips = data.tips;
		if (typeof data.dmActive !== "undefined") u.dmActive = data.dmActive;

		if (typeof data.preferences !== "undefined") {
			if (typeof data.preferences.mention) u.preferences.mention = data.preferences.mention;
		}

		if (typeof data.levels !== "undefined") Object.keys(data.levels).map(k => u.levels[k] = data.levels[k]);

		try {
			await mdb.collection("users").findOneAndUpdate({
				id: this.id
			}, {
				$set: u
			});
		} catch (e) {
			await mdb.collection("users").insertOne({ ...{}, ...{ id: this.id }, ...u });
		}

		// auto reload on edit
		return this.reload();
	}

	async delete() {
		await mdb.collection("users").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await mdb.collection("users").insertOne({ ...{}, ...config, ...{ id: this.id } });
		await this._load(config.defaults.userConfig);
		return this;
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
		return this.levels[g] || 0;
	}
}

export default UserConfig;
