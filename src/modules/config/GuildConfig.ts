import config from "../../config";
import data from "../../default/guildConfig.json";
import { mdb } from "../Database";
import DBCollection from "../../util/DBCollection";
import { Entries as ModLogEntry } from "./ModLog";

interface CommandConfigEntry {
	type: "command" | "category";
	selectionType: "channel" | "user" | "role" | "server";
	selection: string;
}

interface RegistrationQuestion {
	createdBy: string;
	question: string;
	options: {
		[q: string]: string;
	};
}
class GuildConfig {
	id: string;
	blacklist: {
		blacklisted: boolean;
		reason: string;
		blame: string;
	};
	premium: boolean;
	selfAssignableRoles: string[];
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
	settings: {
		nsfw: boolean;
		muteRole?: string;
		fResponse: boolean;
		commandImages: boolean;
		lang: "en";
		prefix: string;
	};
	modlog: DBCollection<ModLogEntry>;
	constructor(id: string, d) {
		this.id = id;
		if (!d) d = data;
		this._load.call(this, d);
	}

	_load(d) {
		this.blacklist = ![undefined, null].includes(d.blacklist) ? d.blacklist : data.blacklist;
		this.premium = ![undefined, null].includes(d.premium) ? d.premium : data.premium;
		this.selfAssignableRoles = ![undefined, null].includes(d.selfAssignableRoles) ? d.selfAssignableRoles : data.selfAssignableRoles;
		this.music = ![undefined, null].includes(d.music) ? d.music : data.music;
		this.modlog = new DBCollection(config.db.database, "guilds", "modlog", this.id);
		this.settings = {
			nsfw: d.settings && d.settings.nsfw ? true : false,
			muteRole: d.settings && d.settings.muteRole ? d.settings.muteRole : null,
			fResponse: d.settings && d.settings.fResponse ? true : false,
			commandImages: d.settings && d.settings.commandImages ? true : false,
			lang: d.settings && d.settings.lang ? d.settings.lang : data.settings.lang,
			prefix: d.settings && d.settings.prefix ? d.settings.prefix : data.settings.prefix
		};
		return null;
	}

	async reload(): Promise<GuildConfig> {
		const r = await mdb.collection("guilds").findOne({ id: this.id });
		this._load.call(this, r);

		return this;
	}

	async edit(d: {
		id?: string;
		blacklist?: {
			blacklisted?: boolean;
			reason?: string;
			blame?: string;
		};
		premium?: boolean;
		music?: {
			volume?: number;
			textChannel?: string;
			queue?: {
				link: string;
				channel: string;
				length: number;
				title: string;
				blame: string;
			}[];
		};
		settings?: {
			nsfw?: boolean;
			muteRole?: string;
			fResponse?: boolean;
			commandImages?: boolean;
			lang?: "en";
			prefix?: string;
		};
	}): Promise<GuildConfig> {
		const g = {
			blacklist: this.blacklist,
			premium: this.premium,
			music: this.music,
			settings: this.settings
		};

		if (typeof d.blacklist !== "undefined") {
			if (typeof d.blacklist.blacklisted !== "undefined") g.blacklist.blacklisted = d.blacklist.blacklisted;
			if (typeof d.blacklist.reason !== "undefined") g.blacklist.reason = d.blacklist.reason;
			if (typeof d.blacklist.blame !== "undefined") g.blacklist.blame = d.blacklist.blame;
		}
		if (typeof d.premium !== "undefined") g.premium = d.premium;

		if (typeof d.music !== "undefined") {
			if (typeof d.music.volume !== "undefined") g.music.volume = d.music.volume;
			if (typeof d.music.textChannel !== "undefined") g.music.textChannel = d.music.textChannel;
		}

		if (typeof d.settings !== "undefined") {
			if (typeof d.settings.commandImages !== "undefined") g.settings.commandImages = d.settings.commandImages;
			if (typeof d.settings.fResponse !== "undefined") g.settings.fResponse = d.settings.fResponse;
			if (typeof d.settings.nsfw !== "undefined") g.settings.nsfw = d.settings.nsfw;
			if (typeof d.settings.muteRole !== "undefined") g.settings.muteRole = d.settings.muteRole;
			if (typeof d.settings.lang !== "undefined") g.settings.lang = d.settings.lang;
			if (typeof d.settings.prefix !== "undefined") g.settings.prefix = d.settings.prefix;
		}

		try {
			await mdb.collection("guilds").findOneAndUpdate({
				id: this.id
			}, {
				$set: g
			});
		} catch (e) {
			await mdb.collection("guilds").insertOne({ id: this.id, ...g });
		}

		// auto reload on edit
		return this.reload();
	}

	async delete(): Promise<void> {
		await mdb.collection("guilds").findOneAndDelete({ id: this.id });
	}

	async reset(): Promise<GuildConfig> {
		// await this.delete();
		// awaitz mdb.collection("guilds").insertOne(Object.assign({}, config, { id: this.id }));
		await this.edit(config as any);
		await this._load(config);
		return this;
	}
}

export default GuildConfig;
