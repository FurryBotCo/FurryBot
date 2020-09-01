import FurryBot from "../../../bot";
import QueueHandler from "./QueueHandler";
import Eris, { IntegrationOptions } from "eris";
import Logger from "../../Logger";
import config from "../../../config";
import ytdl from "ytdl-core";

class JoinError extends Error {
	message: "ERR_INVALID_GUILD" | "ERR_INVALID_CHANNEL" | "ERR_INVALID_CHANNEL_TYPE";
	constructor(message: JoinError["message"]) {
		super(message);
		this.name = "JoinError";
	}
}

export default class GuildMusicHandler {
	readonly guildId: string;
	readonly client: FurryBot;
	readonly queue: QueueHandler;
	readonly channels: {
		voice?: string;
		text?: string;
	};
	constructor(guildId: string, client: FurryBot) {
		this.guildId = guildId;
		this.client = client;
		this.queue = new QueueHandler(this);
		this.queue.pause();
		this.channels = {
			voice: null,
			text: null
		};
	}

	get paused() { return this.queue.paused; }

	async playURL(url: string) {
		if (this.paused) this.unpause();
		if (this.connection?.playing) this.connection?.stopPlaying();
		const v = await ytdl(url, {
			filter: "audioonly"
		});
		this.connection?.play(v);
	}

	get getVideo() { return ytdl.getInfo; }

	async addVideo(url: string, blame: string) {
		const v = await this.getVideo(url);
		const i = await this.queue.addEntry({
			url,
			ageRestricted: v.videoDetails.age_restricted,
			thumbnailURL: `https://i.ytimg.com/vi/${v.videoDetails.videoId}/maxresdefault.jpg`,
			title: v.videoDetails.title,
			length: Number(v.videoDetails.lengthSeconds) * 1e3,
			blame
		});
		return this.queue.getEntry(i);
	}

	async processQueue(skip?: boolean) {
		skip = !!skip;
		if (this.connection?.playing && !skip) return "ALREADY_PLAYING";
		this.connection?.stopPlaying();
		await this.queue.removeEntry(0);
		const e = this.queue.getEntry(0);
		if (!e) return "EMPTY";
	}

	async pause() {
		await this.connection?.pause();
		this.queue.pause();
	}

	async unpause() {
		await this.connection?.resume();
		this.queue.unpause();
	}

	async stop() {
		this.queue.pause();
		await this.connection?.stopPlaying();
		await this.voiceChannel?.leave();
	}

	async clearQueue() { return this.queue.clear(); }

	get connection() { return this.client.bot.voiceConnections.get(this.guildId); }
	get guild() { return this.client.bot.guilds.get(this.guildId); }
	get voiceChannel() { return (this.guild?.channels.get(this.channels.voice) || null) as Eris.VoiceChannel; }
	get textChannel() { return (this.guild?.channels.get(this.channels.text) || null) as Eris.GuildTextableChannel; }
	get voiceState() { return this.guild.members.get(this.client.bot.user.id).voiceState; }

	setTextChannel(id: string) {
		this.channels.text = id;
	}

	async joinChannel(id: string) {
		const g = this.client.bot.guilds.find(g => g.channels.has(id));
		if (!g) throw new JoinError("ERR_INVALID_GUILD");
		const vc = g.channels.get(id);
		if (!vc) throw new JoinError("ERR_INVALID_CHANNEL");
		if (vc.type !== Eris.Constants.ChannelTypes.GUILD_VOICE) throw new JoinError("ERR_INVALID_CHANNEL_TYPE");
		let conn: Eris.VoiceConnection;
		if (vc instanceof Eris.VoiceChannel) { // for typings
			// if (!vc.permissionsOf(this.client.user.id).has("voiceSpeak")) return null;
			conn = await vc.join({});
			await conn.updateVoiceState(false, true);
			conn
				.on("debug", (info) => {
					if (!config.beta && [3].some(o => info.indexOf(`"op":${o}`) !== -1)) return;
					Logger.debug(`Voice[${this.guildId}]`, info);
				})
				.on("disconnect", this.handleDisconnect.bind(this))
				.on("end", this.handleEnd.bind(this))
				.on("error", (err) => {
					if (["4014"].some(e => err.message.indexOf(e) !== -1)) return;
					Logger.error(`Voice[${this.guildId}]`, err);
				})
				.on("warn", (info) => Logger.warn(`Voice[${this.guildId}]`, info));
		}
		this.channels.voice = id;

		return conn;
	}

	async handleDisconnect(err: Error) {

	}
	async handleEnd() {
		Logger.debug("Voice", "end");
	}
}
