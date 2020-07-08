import Eris from "eris";
import Category from "./Category";
import FurryBot from "../../main";
import ExtendedMessage from "../ExtendedMessage";
import CooldownHandler from "./CooldownHandler";
import Logger from "../../util/LoggerV10";
import AntiSpam from "./AntiSpam";
import config from "../../config";
import commandRestrictions from "../../config/extra/other/commandRestrictions";
import Command from "./Command";
import path from "path";


export default class CommandHandler {
	client: FurryBot;
	private cool: CooldownHandler;
	private anti: AntiSpam;
	private cats: Category[];
	constructor(client: FurryBot) {
		this.client = client;
		this.cats = [];
		this.anti = new AntiSpam(client);
		this.cool = new CooldownHandler(client);
	}

	get cooldownHandler() { return this.cool; }
	get antiSpamHandler() { return this.anti; }
	get categories() { return [...this.cats]; }
	get commands() { return [...this.cats.map(c => c.commands).reduce((a, b) => a.concat(b), [])]; }
	get triggers(): string[] { return [...this.commands.reduce((a, b) => a.concat(b.triggers), [])]; }
	get restrictions() { return commandRestrictions(config); }

	getCategory(name: string) {
		return this.categories.find(c => c.name === name) || null;
	}

	addCategory(cat: Category) {
		if (this.categories.map(c => c.name).includes(cat.name)) throw new TypeError(`Duplicated category (name: ${cat.name})`);
		Logger.debug("Command Handler", `Added category ${cat.name} with ${cat.commands.length} commands.`);
		this.cats.push(cat);
		return this;
	}

	removeCategory(cat: string) {
		if (!this.categories.map(c => c.name).includes(cat)) throw new TypeError(`Attempted to remove non-present category ${cat}`);
		this.cats.splice(this.cats.indexOf(this.cats.find(c => c.name === cat)), 1);
		return this;
	}

	getCommand(trigger: string) {
		for (const cat of this.cats) {
			for (const cmd of cat.commands) {
				if (cmd.triggers.includes(trigger.toLowerCase())) return {
					cmd,
					cat
				};
			}
		}

		return null;
	}

	reloadCommand(cmd: string | Command) {
		if (typeof cmd !== "string") cmd = cmd.triggers[0];

		const c = this.getCommand(cmd);

		if (!c) return null;
		return c.cat.reloadCommand(cmd);
	}

	reloadCategory(cat: string | Category) {
		if (typeof cat !== "string") cat = cat.name;

		const c = this.getCategory(cat);
		if (!c) return false;

		this.removeCategory(c.name);

		let i = 0;

		Object.keys(require.cache)
			.filter(k => k.startsWith(c.file.split(path.sep.replace(/\\/, "\\\\")).slice(0, -1).join(path.sep.replace(/\\/, "\\\\")))) // because windows
			.map(f => (i++, delete require.cache[require.resolve(f)]));

		const f = require(c.file).default;

		this.addCategory(f);

		return true;
	}
}
