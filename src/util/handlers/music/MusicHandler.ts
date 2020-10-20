import FurryBot from "../../../main";
import GuildMusicHandler from "./GuildMusicHandler";

export default class MusicHandler {
	client: FurryBot;
	#guildEntries: Map<string, GuildMusicHandler>;
	constructor(client: FurryBot) {
		this.client = client;
		this.#guildEntries = new Map();
	}

	get(guildId: string) {
		const v = this.#guildEntries.get(guildId);
		if (v) return v;
		const n = new GuildMusicHandler(guildId, this.client);
		this.#guildEntries.set(guildId, n);
		return n;
	}
}
