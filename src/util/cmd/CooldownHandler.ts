import Command from "./Command";
import Logger from "../Logger";

export default class CooldownHandler {
	#cooldowns: {
		command: string;
		start: number;
		time: number;
		userId: string;
	}[];
	constructor() {
		this.#cooldowns = [];
	}

	addCooldown(userId: string, command: Command) {
		Logger.debug("CooldownHandler", `Set cooldown for user "${userId}" on command ${command.triggers[0]} for ${command.cooldown}ms.`);
		const start = Date.now();
		this.#cooldowns.push({
			command: command.triggers[0],
			start,
			time: command.cooldown,
			userId
		});
		return start;
	}

	checkCooldown(userId: string, command: Command) {
		const d = Date.now();
		const e = this.#cooldowns.find(c => c.userId === userId && c.command === command.triggers[0]);
		const time = Math.round(!e ? 0 : (e.start + e.time) - d);
		if (e && d > (e.start + e.time)) {
			this.removeCooldown(userId, command);
			return {
				active: false,
				time: 0
			};
		}


		return {
			active: !!e,
			time: time < 1000 ? 1000 : time
		};
	}

	removeCooldown(userId: string, command: Command) {
		Logger.debug("CooldownHandler", `Removed cooldown for user "${userId}" on command ${command.triggers[0]}`);
		const e = this.#cooldowns.find(c => c.userId === userId && c.command === command.triggers[0]);
		if (!e) return false;
		this.#cooldowns.splice(this.#cooldowns.indexOf(e), 1);
		return true;
	}
}
