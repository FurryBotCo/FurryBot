import * as Eris from "eris";
import Queue from "./Queue";
import { Logger } from "../LoggerV8";

type ReactionQueueEntry = {
	type: "add";
	user: "@me";
	reaction: string;
	id: string;
} | {
	type: "remove",
	user: string;
	reaction: string;
	id: string;
} | {
	type: "removeall";
	user: null;
	reaction: null;
	id: string;
};

export default class ReactionQueue extends Queue {
	_entries: ReactionQueueEntry[];
	msg: Eris.Message;
	_interval: NodeJS.Timeout;
	constructor(msg: Eris.Message) {
		super();
		this.msg = msg;
		this._entries = [];
		this._interval = setInterval(this._processQueue.bind(this), .5e3);
	}

	get add(): (...entries: Omit<ReactionQueueEntry, "id">[]) => any {
		return this._add;
	}

	async _processQueue() {
		if (this._entries.length > 0) {
			const r = this._entries.shift();
			if (this._rounds[r.id] && this._rounds[r.id] >= 5) {
				Logger.error("Reaction Queue", `Skipped queue entry ${r.id} (type: ${r.type.toLowerCase()}), failed after 5 retries.`);
				return;
			}
			if (Object.values(r).some(e => [undefined, null, ""].includes(e))) return;
			try {
				switch (r.type.toLowerCase()) {
					case "add":
						await this.msg.addReaction(r.reaction, r.user).catch(() => (this._rounds[r.id] ? this._rounds[r.id]++ : this._rounds[r.id] = 1, this.add(r)));
						break;

					case "remove":
						await this.msg.removeReaction(r.reaction, r.user).catch(() => (this._rounds[r.id] ? this._rounds[r.id]++ : this._rounds[r.id] = 1, this.add(r)));
						break;

					case "removeall":
						await this.msg.removeReactions().catch(() => (this._rounds[r.id] ? this._rounds[r.id]++ : this._rounds[r.id] = 1, this.add(r)));
						break;

					default:
						throw new Error(`invalid queue type "${r.type}"`);
				}
			} catch (e) {
				this.add(r);
			}
		}
	}
}
