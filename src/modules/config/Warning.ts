/*import { mdb } from "@modules/Database.ts";

class Warning {
	_userId: string;
	blame: string;
	gid: string;
	reason: string;
	timestamp: Date;
	wid: number;
	constructor(id: string, data: {
		blame: string;
		gid: string;
		reason: string;
		timestamp: number;
		wid: number;
	}) {
		this._userId = id;
		this.blame = data.blame;
		this.gid = data.gid;
		this.reason = data.reason;
		this.timestamp = new Date(data.timestamp);
		this.wid = data.wid;
	}

	async edit(data: {
		blame?: string;
		reason?: string;
		timestamp?: Date | number;
	}): Promise<Warning> {
		let w = {
			blame: this.blame,
			gid: this.gid,
			reason: this.reason,
			timestamp: this.timestamp.getTime(),
			wid: this.wid
		};

		if (data.blame) w.blame = data.blame;
		if (data.reason) w.reason = data.reason;
		if (data.timestamp) w.timestamp = data.timestamp instanceof Date ? data.timestamp.getTime() : data.timestamp;

		await mdb.collection("users").findOneAndUpdate({
			id: this._userId
		}, {
				$pull: {
					warnings: {
						wid: this.wid
					}
				}
			});

		await mdb.collection("users").findOneAndUpdate({
			id: this._userId
		}, {
				$push: {
					warnings: w
				}
			});

		this.blame = w.blame;
		this.reason = w.reason;
		this.timestamp = new Date(w.timestamp);

		return new Warning(this._userId, w);
	}

	async delete(): Promise<boolean> {
		await mdb.collection("users").findOneAndUpdate({
			id: this._userId
		}, {
				$pull: {
					warnings: {
						wid: this.wid
					}
				}
			});

		return true;
	}

	async reload(): Promise<Warning> {
		const res = await mdb.collection("users").findOne({ id: this._userId }).then(res => res.warnings.filter(w => w.wid === this.wid && w.gid === this.gid)[0]);
		if (!res) return null;
		let w = {
			blame: res.blame,
			gid: this.gid,
			reason: res.reason,
			timestamp: res.timestamp,
			wid: this.wid
		};

		this.blame = w.blame;
		this.reason = w.reason;
		this.timestamp = new Date(w.timestamp);

		return new Warning(this._userId, w);
	}
}

export default Warning;*/

interface Warning {
	blame: string;
	gid: string;
	reason: string;
	timestamp: Date;
	wid: number;
}

export default Warning;