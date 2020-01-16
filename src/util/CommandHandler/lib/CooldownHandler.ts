import Command from "./Command";
import Logger from "../../LoggerV8";

export default class CooldownHandler {
	private _cooldowns: {
		[k: string]: {
			startTime: number;
			time: number;
			user: string;
			timeout: NodeJS.Timeout;
		}[];
	};
	private _inHandler: boolean;
	constructor() {
		this._cooldowns = {};
		this._inHandler = true;
	}

	addCommand(cmd: Command | string): this {
		if (!this._inHandler) throw new TypeError("Cooldown handler add called with invalid context."); let c;
		if (cmd instanceof Command) c = cmd.triggers[0].toLowerCase();
		else c = cmd.toLowerCase();
		// console.debug("CooldownHandler", `Added label "${c}"`, null, chalk.magentaBright("CommandHandler"));
		if (Object.keys(this._cooldowns).map(k => k.toLowerCase()).includes(c)) throw new TypeError("Duplicate command.");

		this._cooldowns[c] = [];

		return this;
	}

	setCooldown(cmd: Command | string, time: number, user: string): this {
		if (!this._inHandler) throw new TypeError("Cooldown handler set called with invalid context.");
		let c;
		if (cmd instanceof Command) {
			if (!time) time = cmd.cooldown;
			c = cmd.triggers[0].toLowerCase();
		}
		else {
			if (!time) time = 0;
			c = cmd.toLowerCase();
		}

		if (!Object.keys(this._cooldowns).includes(c)) {
			Logger.warn("Cooldown Handler", `Cooldown label "${c}" auto created. Cooldown attempted to be set for non-existent label.`);
			this.addCommand(c);
		}

		Logger.debug("Cooldown Handler", `Set cooldown for "${user}" on "${c}" for "${time}"`);
		this._cooldowns[c].push({
			startTime: Date.now(),
			time,
			user,
			timeout: setTimeout(this.removeCooldown.bind(this), time, c, user)
		});
		return this;
	}

	removeCooldown(cmd: Command | string, user: string): this {
		if (!this._inHandler) throw new TypeError("Cooldown handler remove called with invalid context.");
		let c;
		if (cmd instanceof Command) c = cmd.triggers[0].toLowerCase();
		else c = cmd.toLowerCase();
		Logger.debug("Cooldown Handler", `Remove cooldown of "${c}" for user "${user}"`);

		const d = this._cooldowns[c].filter(d => d.user === user);

		do {
			const j = d.shift();
			this._cooldowns[c].splice(this._cooldowns[c].indexOf(j));
		} while (d.length > 0);
		return this;
	}

	checkCooldown(cmd: Command | string, user: string): { c: boolean; time: number; } {
		if (!this._inHandler) throw new TypeError("Cooldown handler check called with invalid context.");
		let c;
		if (cmd instanceof Command) c = cmd.triggers[0].toLowerCase();
		else c = cmd.toLowerCase();
		Logger.debug("Cooldown Handler", `Checking cooldown of "${c}" for user "${user}"`);
		if (!this._cooldowns[c]) this._cooldowns[c] = [];
		const down = this._cooldowns[c].filter(d => d.user === user);
		if (!down || down.length < 1) return {
			c: false,
			time: 0
		};

		let time = (Date.now() - down[0].startTime) - down[0].time;
		if (time > 0) time = 0;
		return {
			c: true,
			time: Math.abs(time)
		};
	}
}
