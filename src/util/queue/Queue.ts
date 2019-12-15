export interface QueueEntry {
	id: string;
}

export default class Queue {
	_entries: QueueEntry[];
	_interval: NodeJS.Timeout;
	_rounds: { [k: string]: number; };
	constructor() {
		this._entries = [];
		this._rounds = {};
	}

	_genId(len = 10, keyset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
		let rand = "";
		for (let i = 0; i < len; i++) rand += keyset.charAt(Math.floor(Math.random() * keyset.length));
		return rand;
	}

	_add(...entries: Omit<QueueEntry, "id">[]) {
		return this._entries.push(...entries.map(e => ({ ...e, id: this._genId() })));
	}

	clear() {
		return this._entries = [];
	}

	destroy() {
		if (this._interval) clearInterval(this._interval);
		if (this.entries.length > 0) this._entries = [];
	}

	get queue() {
		return this._entries;
	}

	get entries() {
		return this._entries;
	}
}
