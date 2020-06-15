import Eris from "eris";
import FurryBot from "../main";
import { Player, TrackResponse, Track } from "lavalink";
import GuildConfig from "../modules/config/GuildConfig";
import db from "../modules/Database";
import deasync from "deasync";
import EmbedBuilder from "./EmbedBuilder";
import { Colors } from "./Constants";
import { Time } from "./Functions";
import Logger from "./LoggerV9";

interface ExtendedTrack extends Track {
	addedBy?: string;
	addedTime: number;
}

// custom array to make entries() return specially
class EntryArray<T> extends Array<T> {
	constructor(e: T[]) {
		super();
		this.push(...e);
	}

	get current() { return this[0]; }
	get queue() { return Array.from(this).slice(1); }
}

export default class MusicQueue {
	guild: Eris.Guild;
	txt: Eris.TextChannel;
	vc: Eris.VoiceChannel;
	client: FurryBot;
	gConfig: GuildConfig;
	private setupFinished: boolean;
	private _entires: ExtendedTrack[];
	constructor(guild: Eris.Guild | string, txt: Eris.TextChannel | string, vc: Eris.VoiceChannel | string, client: FurryBot) {
		if (!client) throw new TypeError("ERR_INVALID_CLIENT");
		this.client = client;
		this.guild = typeof guild === "string" ? client.bot.guilds.get(guild) : guild;
		if (!this.guild) throw new TypeError("ERR_INVALID_GUILD");
		this.txt = typeof txt === "string" ? this.guild.channels.get(txt) : txt;
		if (!this.txt) throw new TypeError("ERR_INVALID_TXT");
		this.vc = typeof vc === "string" ? this.guild.channels.get(vc) : vc;
		if (!this.vc) throw new TypeError("ERR_INVALID_VC");
		this._entires = [];
		this.setupFinished = false;
		this.setup.call(this);
	}

	get entries() { return new EntryArray(this._entires); }
	get player() { return this.client.v.get(this.guild.id); }

	async setup() {
		this.gConfig = await db.getGuild(this.guild.id, true);
		if (!this.vc.voiceMembers.has(this.client.bot.user.id)) await this.player.join(this.vc.id);
		this.setupFinished = true;
	}

	async testReady() {
		while (this.setupFinished !== true) await new Promise((a, b) => setTimeout(a, 50));
		return;
	}

	async search(type: "youtube", query: string) {
		await this.testReady();
		if (!query) throw new TypeError("ERR_MISSING_SEARCH_QUERY");
		let t: TrackResponse;

		switch (type) {
			case "youtube": {
				t = await this.client.getRecommendedNode().load(`ytsearch:${query}`);
				break;
			}

			default: throw new TypeError("ERR_INVALID_SEARCH_TYPE");
		}

		return !t ? [] : t.tracks;
	}

	async processNext(track?: string) {
		await this.testReady();
		if (!!track && this._entires.length >= 1 && Buffer.from(track, "base64").toString("ascii").indexOf(this._entires[0].info.identifier) !== -1) this._entires.shift();
		const e = this._entires[0];
		if (!e) {
			// end, nothing left in the queue
			await this.player.stop();
			try {
				this.vc.leave();
			} catch (e) { }
			await this.txt.createMessage({
				embed: new EmbedBuilder(this.gConfig.settings.lang)
					.setTitle("{lang:other.music.queueEnd.title}")
					.setDescription("{lang:other.music.queueEnd.description}")
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.red)
					.setFooter(`{lang:other.music.footer|${this.vc.name}}`)
					.toJSON()
			});
			return false;
		} else {
			await this.player.play(e);
			await this.txt.createMessage({
				embed: new EmbedBuilder(this.gConfig.settings.lang)
					.setTitle("{lang:other.music.nowPlaying.title}")
					.setDescription(`{lang:other.music.nowPlaying.description|${e.info.title}|${this.vc.name}|${Time.ms(e.info.length, true)}}`)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.red)
					.setFooter(`{lang:other.music.footer|${this.vc.name}}`)
					.toJSON()
			});

			return true;
		}
	}

	async handleException(error: string) {
		const e = this._entires[0];
		await this.txt.createMessage({
			embed: new EmbedBuilder(this.gConfig.settings.lang)
				.setTitle("{lang:other.music.error.title}")
				.setDescription(!e ? `{lang:other.music.error.descriptionNoEntry|${error}}` : `{lang:other.music.error.description|${e.info.title}|${e.info.author}|${error}`)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.red)
				.setFooter(`{lang:other.music.footer|${this.vc.name}}`)
				.toJSON()
		});
		if (!!e) Logger.warn(`MusicQueue[${this.guild.id}]`, `Error while processing https://www.youtube.com/watch?v=${e.info.identifier}`);

		return !e ? this.processNext() : this.processNext(e.track);
	}

	async add(track: Track, addedBy: string, immediate?: boolean) {
		await this.testReady();
		if (!track) throw new TypeError("ERR_INVALID_TRACK");
		const d = Date.now();
		this._entires.push({
			...track,
			addedTime: d,
			addedBy
		});
		if (!!immediate) this.processNext();

		return this;
	}
}
