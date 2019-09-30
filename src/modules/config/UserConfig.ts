import config from "../../default/userConfig.json";
import { mdb } from "../Database";

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
	blacklist: {
		blacklisted: boolean;
		reason: string;
		blame: string;
	};
	marriage: {
		married: boolean;
		partner: string;
	};
	warnings: Warning[];
	bal: number;
	tips: boolean;
	dmActive: boolean;
	patreon: {
		amount: number;
		createdAt: number;
		declinedAt: number;
		donator?: boolean;
		patronId: string;
	};
	// voteCount: number;
	// lastVote: number;
	constructor(id, data) {
		this.id = id;
		if (!data) data = config;
		this._load.call(this, data);
	}

	_load(data) {
		this.blacklist = ![undefined, null].includes(data.blacklist) ? data.blacklist : config.blacklist;
		this.marriage = ![undefined, null].includes(data.marriage) ? data.marriage : config.marriage;
		this.warnings = ![undefined, null].includes(data.warnings) ? data.warnings : config.warnings;
		this.bal = ![undefined, null].includes(data.bal) ? data.bal : config.bal;
		this.tips = ![undefined, null].includes(data.tips) ? data.tips : config.tips;
		this.dmActive = ![undefined, null].includes(data.dmActive) ? data.dmActive : config.dmActive;
		this.patreon = ![undefined, null].includes(data.patreon) ? data.patreon : config.patreon;
		// this.voteCount = ![undefined, null].includes(data.voteCount) ? data.voteCount : config.voteCount;
		// this.lastVote = ![undefined, null].includes(data.lastVote) ? data.lastVote : config.lastVote;

		return null;
	}

	async reload(): Promise<UserConfig> {
		const r = await mdb.collection("users").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(data: {
		blacklist?: {
			blacklisted?: boolean;
			reason?: string;
			blame?: string;
		};
		marriage?: {
			married?: boolean;
			partner?: string;
		}
		bal?: number;
		tips?: boolean;
		dmActive?: boolean;
		patreon?: {
			amount?: number;
			createdAt?: number;
			declinedAt?: number;
			donator?: boolean;
			patronId?: string;
		};
	}): Promise<UserConfig> {
		const u = {
			blacklist: this.blacklist,
			marriage: this.marriage,
			id: this.id,
			bal: this.bal,
			tips: this.tips,
			dmActive: this.dmActive,
			patreon: this.patreon
		};

		if (typeof data.blacklist !== "undefined") {
			if (typeof data.blacklist.blacklisted !== "undefined") u.blacklist.blacklisted = data.blacklist.blacklisted;
			if (typeof data.blacklist.reason !== "undefined") u.blacklist.reason = data.blacklist.reason;
			if (typeof data.blacklist.blame !== "undefined") u.blacklist.blame = data.blacklist.blame;
		}

		if (typeof data.marriage !== "undefined") {
			if (typeof data.marriage.married !== "undefined") u.marriage.married = data.marriage.married;
			if (typeof data.marriage.partner !== "undefined") u.marriage.partner = data.marriage.partner;
		}

		if (typeof data.bal !== "undefined") u.bal = data.bal;
		if (typeof data.tips !== "undefined") u.tips = data.tips;
		if (typeof data.dmActive !== "undefined") u.dmActive = data.dmActive;

		if (typeof data.patreon !== "undefined") {
			if (typeof data.patreon.amount) u.patreon.amount = data.patreon.amount;
			if (typeof data.patreon.createdAt) u.patreon.createdAt = data.patreon.createdAt;
			if (typeof data.patreon.declinedAt) u.patreon.declinedAt = data.patreon.declinedAt;
			if (typeof data.patreon.donator) u.patreon.donator = data.patreon.donator;
			if (typeof data.patreon.patronId) u.patreon.patronId = data.patreon.patronId;
		}
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

	async delete(): Promise<void> {
		await mdb.collection("users").findOneAndDelete({ id: this.id });
	}

	async reset(): Promise<UserConfig> {
		await this.delete();
		await mdb.collection("users").insertOne({ ...{}, ...config, ...{ id: this.id } });
		await this._load(config);
		return this;
	}
}

export default UserConfig;
