import FurryBot from "../../main";
import config from "../../config";
import { GAME_TYPES } from "core";
import Eris from "eris";
import { Stats } from "clustering";

export default class StatusHandler {
	static client: FurryBot;
	static statuses: Array<{
		status: Eris.Status;
		name: (client: FurryBot, stats: Stats) => string;
		type: Exclude<keyof typeof GAME_TYPES, "CUSTOM">;
		filter: (hour: number, minut: number, second: number) => boolean;
	}> = [];
	static interval: NodeJS.Timeout;

	static init(bot: FurryBot) {
		this.client = bot;

		this
			.add(
				"online",
				(client, stats) => `${config.defaults.prefix}help in ${stats?.guilds || client.bot.guilds.size} servers`,
				"PLAYING",
				(hour: number, minute: number, second: number) => (minute % 2) === 0 && second === 0
			)
			.add(
				"online",
				(client, stats) => `${config.defaults.prefix}help with ${stats?.users || client.bot.users.size} users`,
				"WATCHING",
				(hour: number, minute: number, second: number) => (minute % 2) === 0 && second === 20
			)
			.add(
				"online",
				(client, stats) => `${config.defaults.prefix}help in ${stats?.guildChannels || Object.keys(client.bot.channelGuildMap).length} channels`,
				"LISTENING",
				(hour: number, minute: number, second: number) => (minute % 2) === 0 && second === 40
			)
			.add(
				"online",
				(client) => `${config.defaults.prefix}help with ${client.cmd.commands.length} commands`,
				"PLAYING",
				(hour: number, minute: number, second: number) => (minute % 2) === 1 && second === 0
			)
			.add(
				"online",
				() => `${config.defaults.prefix}help | https://furry.bot`,
				"PLAYING",
				(hour: number, minute: number, second: number) => (minute % 2) === 1 && second === 20
			)
			.add(
				"online",
				() => `${config.defaults.prefix}help | https://yiff.rest`,
				"PLAYING",
				(hour: number, minute: number, second: number) => (minute % 2) === 1 && second === 40
			);

		this.interval = setInterval(this.run.bind(this), 1e3);

		return this;
	}

	static add(status: Eris.Status, name: (client: FurryBot, stats: Stats) => string, type: Exclude<keyof typeof GAME_TYPES, "CUSTOM">, filter: (hour: number, minut: number, second: number) => boolean) {
		this.statuses.push({
			status,
			name,
			type,
			filter
		});
		return this;
	}

	static async run(manualDate?: Date) {
		const d = manualDate ?? new Date();
		const stats = undefined; // await this.client.ipc.getStats();
		const s = this.statuses.find(t => t.filter(d.getHours(), d.getMinutes(), d.getSeconds()));
		if (!s) return;
		else {
			this.client.bot.editStatus(s.status, {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				name: s.name(this.client, stats as any),
				type: GAME_TYPES[s.type]
			});
		}
	}

	static stop() {
		if (this.interval) clearInterval(this.interval);
	}
}
