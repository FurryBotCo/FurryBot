import config from "@src/default/guildConfig.json";
import { mdb } from "../Database";
import CommandConfigEntry from "./CommandConfigEntry";

class GuildConfig {
	id: string;
	prefix: string;
	nsfwEnabled: boolean;
	blacklist: {
		blacklisted: boolean;
		reason: string;
		blame: string;
	};
	lang: string;
	commandImages: boolean;
	deleteCommands: boolean;
	muteRole: string;
	premium: boolean;
	selfAssignableRoles: string[];
	fResponseEnabled: boolean;
	music: {
		volume: number;
		textChannel: string;
		queue: {
			link: string;
			channel: string;
			length: number;
			title: string;
			blame: string;
		}[];
	};
	commandConfig?: {
		disabled?: CommandConfigEntry[];
		enabled?: CommandConfigEntry[];
	};
	constructor(id, data) {
		this.id = id;
		if (!data) data = config;
		this._load.call(this, data);
	}

	_load(data) {
		this.prefix = ![undefined, null].includes(data.prefix) ? data.prefix : config.prefix;
		this.nsfwEnabled = ![undefined, null].includes(data.nsfwEnabled) ? data.nsfwEnabled : config.nsfwEnabled;
		this.blacklist = ![undefined, null].includes(data.blacklist) ? data.blacklist : config.blacklist;
		this.lang = ![undefined, null].includes(data.lang) ? data.lang : config.lang;
		this.commandImages = ![undefined, null].includes(data.commandImages) ? data.commandImages : config.commandImages;
		this.deleteCommands = ![undefined, null].includes(data.deleteCommands) ? data.deleteCommands : config.deleteCommands;
		this.muteRole = ![undefined].includes(data.muteRole) ? data.muteRole : config.muteRole;
		this.premium = ![undefined, null].includes(data.premium) ? data.premium : config.premium;
		this.selfAssignableRoles = ![undefined, null].includes(data.selfAssignableRoles) ? data.selfAssignableRoles : config.selfAssignableRoles;
		this.fResponseEnabled = ![undefined, null].includes(data.fResponseEnabled) ? data.fResponseEnabled : config.fResponseEnabled;
		this.music = ![undefined, null].includes(data.music) ? data.music : config.music;

		return null;
	}

	async reload(): Promise<GuildConfig> {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(data: {
		prefix?: string;
		nsfwEnabled?: boolean;
		blacklist?: {
			blacklisted?: boolean;
			reason?: string;
			blame?: string;
		};
		lang?: string;
		commandImages?: boolean;
		deleteCommands?: boolean;
		muteRole?: string;
		premium?: boolean;
		fResponseEnabled?: boolean;
		music?: {
			volume?: number;
			textChannel?: string;
		}
	}): Promise<GuildConfig> {
		const g = {
			prefix: this.prefix,
			nsfwEnabled: this.nsfwEnabled,
			blacklist: this.blacklist,
			lang: this.lang,
			commandImages: this.commandImages,
			deleteCommands: this.deleteCommands,
			muteRole: this.muteRole,
			premium: this.premium,
			fResponseEnabled: this.fResponseEnabled,
			music: this.music
		};

		if (typeof data.prefix !== "undefined") g.prefix = data.prefix;
		if (typeof data.nsfwEnabled !== "undefined") g.nsfwEnabled = data.nsfwEnabled;
		if (typeof data.blacklist !== "undefined") {
			if (typeof data.blacklist.blacklisted !== "undefined") g.blacklist.blacklisted = data.blacklist.blacklisted;
			if (typeof data.blacklist.reason !== "undefined") g.blacklist.reason = data.blacklist.reason;
			if (typeof data.blacklist.blame !== "undefined") g.blacklist.blame = data.blacklist.blame;
		}
		if (typeof data.lang !== "undefined") g.lang = data.lang;
		if (typeof data.commandImages !== "undefined") g.commandImages = data.commandImages;
		if (typeof data.deleteCommands !== "undefined") g.deleteCommands = data.deleteCommands;
		if (typeof data.muteRole !== "undefined") g.muteRole = data.muteRole;
		if (typeof data.premium !== "undefined") g.premium = data.premium;
		if (typeof data.fResponseEnabled !== "undefined") g.fResponseEnabled = data.fResponseEnabled;

		if (typeof data.music !== "undefined") {
			if (typeof data.music.volume !== "undefined") g.music.volume = data.music.volume;
			if (typeof data.music.textChannel !== "undefined") g.music.textChannel = data.music.textChannel;
		}

		try {
			await mdb.collection("guilds").findOneAndUpdate({
				id: this.id
			}, {
					$set: g
				});
		} catch (e) {
			await mdb.collection("guilds").insertOne({ ...{}, ...{ id: this.id }, ...g });
		}

		// auto reload on edit
		return this.reload();
	}

	async delete(): Promise<void> {
		await mdb.collection("guilds").findOneAndDelete({ id: this.id });
	}

	async reset(): Promise<GuildConfig> {
		// await this.delete();
		// await mdb.collection("guilds").insertOne(Object.assign({}, config, { id: this.id }));
		await this.edit(config);
		await this._load(config);
		return this;
	}
}

export default GuildConfig;