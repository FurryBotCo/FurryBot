import GuildMusicHandler from "./GuildMusicHandler";
import Redis from "../../Redis";

interface QueueEntry {
	url: string;
	ageRestricted: boolean;
	thumbnailURL: string;
	title: string;
	length: number;
	blame: string;
}

export default class QueueHandler {
	handler: GuildMusicHandler;
	paused: boolean;
	constructor(handler: GuildMusicHandler) {
		this.handler = handler;
	}

	pause() {
		this.paused = true;
	}
	unpause() {
		this.paused = false;
	}

	getKey() {
		return `music:${this.handler.guildId}:queue`;
	}

	async getLength() {
		return Redis.llen(this.getKey());
	}

	async getPlayLength() {
		const e = await this.getEntries();
		return e.reduce((a, b) => b.length + a, 0);
	}

	async getEntries(): Promise<QueueEntry[]> {
		const len = await this.getLength();
		if (!len) return [];
		const v = await Redis.lrange(this.getKey(), 0, len);
		return v.map(e => JSON.parse(e));
	}

	async clear() {
		const len = await this.getLength();
		await Redis.del(this.getKey());
		return len;
	}

	async getEntry(index: number): Promise<QueueEntry> {
		const v = await Redis.lindex(this.getKey(), index);
		return !v ? null : JSON.parse(v);
	}

	async addEntry(d: QueueEntry | string) {
		return Redis.rpush(this.getKey(), typeof d === "string" ? d : JSON.stringify(d)).then(v => v - 1); // Redis returns index+1 ?
	}

	async removeEntry(index: number) {
		const e = await Redis.lindex(this.getKey(), index);
		if (!e) return false;
		/* 0 = none deleted, X = X deleted */
		const d = await Redis.lrem(this.getKey(), 1, e);
		if (!d) return false;
		else return true;
	}
}
