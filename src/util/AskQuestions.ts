import * as Eris from "eris";
import MessageCollector from "./MessageCollector";
import FurryBot from "@FurryBot";

interface Question {
	createdBy: string;
	question: string;
	options: {
		[q: string]: string;
	};
}

type ExtendedQuestion = Question & { asked?: boolean; timeout?: number; };

export default class Questions {
	private _questions: ExtendedQuestion[];
	private _channel: Eris.TextableChannel;
	private _user: Eris.Member | Eris.User;
	private _defaultTimeout: number;
	private _MessageCollector: MessageCollector;
	private _client: FurryBot;
	constructor(channel: Eris.PrivateChannel, user: Eris.User, timeout: number, client: FurryBot);
	constructor(channel: Eris.TextChannel, user: Eris.Member, timeout: number, client: FurryBot);

	constructor(channel: Eris.TextableChannel, user: Eris.User | Eris.Member, timeout: number, client: FurryBot) {
		this._questions = [];
		this._channel = channel;
		this._user = user;
		this._defaultTimeout = timeout || 6e4;
		this._MessageCollector = new MessageCollector(client);
		this._client = client;
	}

	get questions() {
		return this._questions;
	}

	addQuestion(q: string, o: { [opt: string]: string }, t?: number) {
		if (!q) throw new TypeError("missing question");
		if (!o || Object.keys(o).length < 1) throw new TypeError("missing/invalid options");
		this._questions.push({
			createdBy: null,
			question: q,
			options: o,
			asked: false,
			timeout: t || this._defaultTimeout
		});

		return this;
	}

	ask(n?: number, reAsk?: boolean, ch?: Eris.TextChannel, u?: Eris.Member): Promise<string[]>;
	ask(n?: number, reAsk?: boolean, ch?: Eris.PrivateChannel, u?: Eris.User): Promise<string[]>;

	async ask(n?: number, reAsk?: boolean, ch?: Eris.TextChannel | Eris.PrivateChannel, u?: Eris.Member | Eris.User) {
		reAsk = reAsk ? false : true;
		if (!ch) ch = this._channel;
		if (!u) u = this._user;

		const a = (async (q, f = (m: Eris.Message) => true, t: number) => {
			await ch.createMessage(q);
			const c = await this._MessageCollector.awaitMessage(ch.id, u.id, t, f);
			if (!c) return "TIMEOUT";
			else return c.content;
		});

		if (!n) {
			const q = reAsk ? this.questions : this.questions.filter(q => !q.asked);

			const res = await Promise.all(q.map(async (qs) => a(qs, (m) => Object.keys(qs.options).includes(m.content.toLowerCase()), qs.timeout || this._defaultTimeout).then(rs => {
				if (rs === "TIMEOUT") throw new Error("TIMEOUT");
				return rs;
			})));

			return res;
		} else {
			const q = this.questions[n];

			if (!q) throw new TypeError("invalid question number");
			if (!reAsk && q.asked) throw new TypeError("this question has already been asked.");

			const d = await a(q.question, (m) => Object.keys(q.options).includes(m.content.toLowerCase()), q.timeout);

			if (d === "TIMEOUT") throw new Error("TIMEOUT");

			return [d];
		}
	}
}