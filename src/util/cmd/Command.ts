/// <reference path="../@types/global.d.ts" />
import Category from "./Category";
import FurryBot from "../../main";
import ExtendedMessage from "../ExtendedMessage";
import CommandError from "./CommandError";
import path from "path";

type OverrideReturn = any | "DEFAULT" | "ALLOW";

export default class Command {
	triggers: ArrayOneOrMore<string>;
	permissions: {
		bot: ErisPermissions[];
		// permissions that can be omitted but shouldn't
		botUseful: ErisPermissions[];
		user: ErisPermissions[];
	};
	restrictions: CommandRestrictions[];
	usage: string;
	description: string;
	cooldown: number;
	donatorCooldown: number;
	category: Category;
	hasSlashVariant: boolean;
	run: (this: FurryBot, msg: ExtendedMessage, cmd: Command) => Promise<any>;
	// allow isn't used right now but it can be a bypass system in the future
	overrides:
		{
			permissionError: (this: FurryBot, msg: ExtendedMessage, cmd: Command, type: "user" | "bot", permissions: ErisPermissions[]) => Promise<OverrideReturn>;
			invalidUsage: (this: FurryBot, msg: ExtendedMessage, cmd: Command, err: CommandError<"ERR_INVALID_USAGE">) => Promise<OverrideReturn>;
			help: (this: FurryBot, msg: ExtendedMessage, cmd: Command) => Promise<OverrideReturn>;
			cooldown: (this: FurryBot, msg: ExtendedMessage, cmd: Command, time: number) => Promise<OverrideReturn>;
		} & {
			[k in "beta" | "developer" | "donator" | "guildOwner" | "nsfw" | "premium" | "supportServer"]: (this: FurryBot, msg: ExtendedMessage, cmd: Command) => Promise<OverrideReturn>;
		};
	file: string;
	constructor(triggers: ArrayOneOrMore<string>, file: string) {
		if (!triggers) throw new TypeError("One or more triggers must be provided.");

		this.triggers = triggers;
		this.permissions = {
			bot: [],
			botUseful: [],
			user: []
		};
		this.restrictions = [];
		this.usage = "";
		this.description = "";
		this.cooldown = 0;
		this.donatorCooldown = null;
		this.category = null;
		this.run = null;
		this.overrides = {
			permissionError: async () => "DEFAULT",
			invalidUsage: async () => "DEFAULT",
			help: async () => "DEFAULT",
			beta: async () => "DEFAULT",
			developer: async () => "DEFAULT",
			donator: async () => "DEFAULT",
			guildOwner: async () => "DEFAULT",
			nsfw: async () => "DEFAULT",
			premium: async () => "DEFAULT",
			supportServer: async () => "DEFAULT",
			cooldown: async () => "DEFAULT"
		};
		this.file = file;
	}

	get lang() {
		return `commands.${this.category.name}.${this.triggers[0]}`;
	}
	get tsFile() {
		return `${path.dirname(this.file).replace(/build(\\|\/)/, "")}/${path.basename(this.file).replace(/.js/, ".ts")}`;
	}

	setTriggers(data: Command["triggers"]) {
		if (!data) throw new TypeError("One or more triggers must be provided.");
		this.triggers = data;
		return this;
	}

	setBotPermissions(data: Command["permissions"]["bot"], data2?: Command["permissions"]["botUseful"]) {
		this.permissions.bot = data || [];
		this.permissions.botUseful = data2 || [];
		return this;
	}

	setUserPermissions(data: Command["permissions"]["user"]) {
		this.permissions.user = data || [];
		return this;
	}

	setPermissions(data: Command["permissions"]["bot"], data2: Command["permissions"]["botUseful"], data3: Command["permissions"]["user"]) {
		this.setBotPermissions(data || this.permissions.bot, data2 || this.permissions.botUseful);
		this.setUserPermissions(data3 || this.permissions.user);
	}

	setRestrictions(data: Command["restrictions"]) {
		this.restrictions = data ?? [];
		return this;
	}

	setUsage(data: Command["usage"]) {
		this.usage = data;
		return this;
	}

	setDescription(data: Command["description"]) {
		this.description = data;
		return this;
	}

	setCooldown(data: Command["cooldown"], donatorSame = true) {
		this.cooldown = data;
		if (donatorSame) this.donatorCooldown = data;
		return this;
	}

	setDonatorCooldown(data: Command["donatorCooldown"]) {
		this.donatorCooldown = data;
		return this;
	}

	setCategory(data: Command["category"]) {
		this.category = data;
		return this;
	}

	setExecutor(data: Command["run"]) {
		this.run = data;
		return this;
	}

	setOverride<K extends keyof Command["overrides"]>(type: K, override: Command["overrides"][K]) {
		this.overrides[type] = override;
		return this;
	}

	runOverride<K extends keyof Command["overrides"]>(type: K, client: FurryBot, ...args: Parameters<Command["overrides"][K]>): ReturnType<Command["overrides"][K]> {
		return this.overrides[type as any].call(client, ...args);
	}

	setHasSlashVariant(data: boolean) {
		this.hasSlashVariant = data;
		return this;
	}
}
