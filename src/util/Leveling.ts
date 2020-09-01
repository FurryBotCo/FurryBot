import FurryBot from "../bot";

export class Leveling {
	client: FurryBot;
	/**
	 * @type {Map<string, number>} - <user id, end time>
	 * @memberof Leveling
	 */
	cooldowns: Map<string, number>;
	#int: NodeJS.Timeout;
	time: {
		normal: number;
		vote: number;
	};
	constructor(client: FurryBot) {
		this.client = client;
		this.cooldowns = new Map();
		this.#int = setInterval(() => {
			const d = Date.now();
			for (const [id, time] of this.cooldowns) if (d >= time) this.cooldowns.delete(id);
		}, 1e3);
		this.time = {
			normal: 6e4,
			vote: 3e4
		};
	}

	addCooldown(id: string, time: keyof Leveling["time"]) {
		this.cooldowns.set(id, Date.now() + this.time[time]);
		return true;
	}

	removeCooldown(id: string) {
		return this.cooldowns.delete(id);
	}

	checkCooldown(id: string) {
		return this.cooldowns.has(id);
	}
}
