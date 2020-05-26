import Eris from "eris";
import FurryBot from "../../main";
import Logger from "../../util/LoggerV9";


export default class CooldownHandler {
	client: FurryBot;
	private cooldowns: {
		user: string;
		command: string;
		creation: number;
		time: number;
	}[];
	private cooldownInterval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		this.client = client;
		this.cooldowns = [];
		this.cooldownInterval = setInterval(() => {
			const d = Date.now();
			for (const c of this.cooldowns) if ((c.creation + c.time) < d) this.cooldowns.splice(this.cooldowns.indexOf(c));
		}, 1e3);
	}

	add(user: string, command: string, time: number) {
		Logger.debug("Cooldown Handler", `Set cooldown ${time} for command "${command}" for user "${user}"`);
		const creation = Date.now();
		this.cooldowns.push({
			user,
			command,
			creation,
			time
		});
		return this;
	}

	check(user: string, command: string) {
		if (this.cooldowns.filter(c => c.user === user && c.command === command).length !== 0) return true;
		else return false;
	}

	get(user: string, command: string) {
		return this.cooldowns.find(c => c.user === user && c.command === command);
	}
}
