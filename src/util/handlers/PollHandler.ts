import FurryBot from "../../main";
import { EventEmitter } from "tsee";
import { keyword } from "chalk";
import Logger from "../Logger";
import Eris from "eris";
import Language, { Languages } from "../Language";
import Time from "../Functions/Time";
import EmbedBuilder from "../EmbedBuilder";
import config from "../../config";
import Utility from "../Functions/Utility";

export default class PollHandler extends EventEmitter<{
	end: (message: Eris.Message, options: string[], lang: Languages, start: number, end: number, reactions: string[][]) => void;
}> {
	#client: FurryBot;
	#polls: {
		message: Eris.Message;
		options: string[];
		lang: Languages;
		start: number;
		end: number;
		reactions: string[][];
	}[];
	#interval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		super();
		this.#client = client;
		this.#polls = [];
		this.on("end", this.endHandler.bind(this));
		this.#interval = setInterval(async () => {
			const d = new Date();
			for (const p of this.#polls) {
				const e = p.message.embeds.find(l => l.type === "rich");
				if (!e) return;
				const v = e.description.split("\n");
				const l = Math.floor((p.end - d.getTime()) / 1e3) * 1e3;
				if (config.beta) Logger.debug("Poll Handler", Time.ms(l, true));

				if (l <= 0) {
					v[0] = `${Language.get(p.lang, "commands.utility.poll.time")}: **Finished**`;
					e.description = v.join("\n");
					e.footer.text = Language.get(p.lang, "commands.utility.poll.endedAt");
					await p.message.edit({
						embed: e
					}).catch(err => null);
					this.endPoll(p.message.id);
				} else {
					v[0] = `${Language.get(p.lang, "commands.utility.poll.time", [])}: **${Time.ms(p.end - d.getTime(), true)}**`;
					e.description = v.join("\n");
					if (l <= 1.2e5) {
						if (l % 1.5e4 === 0) {
							await p.message.edit({
								embed: e
							}).catch(err => null);
							if (config.beta) Logger.debug("Poll Handler", "15 second update");
						}
					} else if (l <= 6e5) {
						if (l % 6e4 === 0) {
							await p.message.edit({
								embed: e
							}).catch(err => null);
							if (config.beta) Logger.debug("Poll Handler", "60 second update");
						}
					} else {
						if (l % 3e5 === 0) {
							await p.message.edit({
								embed: e
							}).catch(err => null);
							if (config.beta) Logger.debug("Poll Handler", "5 minute update");
						}
					}
				}
			}
		}, 1e3);
	}

	async endHandler(message: Eris.Message, options: string[], lang: Languages, start: number, end: number, reactions: string[][]) {
		Logger.debug("Poll Handler", `Poll in channel ${message.channel.id} ended.`);
		const t = Math.floor((end - start) / 1e3) * 1e3;
		const users = [];
		let i = 0;
		const c = [];
		for (const r of reactions) {
			c[i] = 0;
			for (const u of r) {
				if (users.includes(u)) continue;
				else (users.push(u), c[i]++);
			}
			i++;
		}
		const longest = Utility.getLongestString(c);
		const p = Utility.getPercents(c);
		const total = c.reduce((a, b) => a + b, 0);

		return message.channel.createMessage({
			embed: new EmbedBuilder(lang)
				.setTitle(`{lang:commands.utility.poll.results|${Time.ms(t + 1e3, true)}}`)
				.setDescription([
					...(total === 0 ?
						[
							"{lang:commands.utility.poll.noVotes}"
						] :
						c.map((v, i) => `(${p[i].percent}%) ${Utility.numberToEmoji(v.toString().padStart(longest, "0"))} - ${options[i]}`)
					)
				].join("\n"))
				.toJSON()
		}).catch(err => null);
	}

	addPoll(message: Eris.Message, options: string[], lang: Languages, end: number) {
		this.#polls.push({
			start: Date.now(),
			options,
			message,
			lang,
			end,
			reactions: options.map(() => [])
		});
		return true;
	}

	endPoll(messageId: string) {
		console.log("end poll");
		const p = this.#polls.find(l => l.message.id === messageId);
		if (!p) return false;
		this.#polls.splice(this.#polls.indexOf(p), 1);
		this.emit("end", p.message, p.options, p.lang, p.start, p.end, p.reactions);
		return true;
	}

	addReaction(messageId: string, userId: string, option: number) {
		const p = this.#polls.find(l => l.message.id === messageId);
		if (!p) return false;
		if (p.options.length - 1 < option) return false;
		this.#polls[this.#polls.indexOf(p)].reactions[option].push(userId);
		return true;
	}

	removeReaction(messageId: string, userId: string, option: number) {
		const p = this.#polls.find(l => l.message.id === messageId);
		if (!p) return false;
		if (p.options.length - 1 < option) return false;
		this.#polls[this.#polls.indexOf(p)].reactions[option].splice(this.#polls[this.#polls.indexOf(p)].reactions[option].indexOf(userId), 1);
		return true;
	}
}
