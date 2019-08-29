interface QueueEntry {

}

export default class Queue {
	_entries: QueueEntry[];
	_interval: NodeJS.Timeout;
	constructor() {
		this._entries = [];
	}

	_add(...entries: QueueEntry[]) {
		return this._entries.push(...entries);
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