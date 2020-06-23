import FurryBot from "../../main";

interface CommandEntry {
	time: number;
	user: string;
	type: "command";
	command: string;
}

interface AutoResponseEntry {
	time: number;
	user: string;
	type: "autoResponse";
	autoResponse: string;
}

export default class AntiSpam {
	client: FurryBot;
	private entries: (CommandEntry | AutoResponseEntry)[];
	private removeInterval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		this.client = client;
		this.entries = [];
		this.removeInterval = setInterval(() => {
			const d = Date.now();
			this.entries = this.entries.filter(e => e.time + 3e4 > d);
		}, 1e3);
	}

	add(user: string, type: "command", command: string);
	add(user: string, type: "autoResponse", autoResponse: string); // tslint:disable-line unified-signatures
	add(user: string, type: "command" | "autoResponse", d: string) {
		const time = Date.now();
		this.entries.push({
			time,
			user,
			type,
			...(type === "command" ? ({ command: d }) : type === "autoResponse" ? ({ autoResponse: d }) : {}) as any
		});
		return this;
	}

	get(user: string, type: "command"): CommandEntry[];
	get(user: string, type: "autoResponse"): AutoResponseEntry[]; // tslint:disable-line unified-signatures
	get(user: string, type: "command" | "autoResponse"): (CommandEntry | AutoResponseEntry)[] {
		return this.entries.filter(e => e.user === user && e.type === type/* && (type === "command" && (e as any).command === d) || (type === "autoResponse" && (e as any).autoResponse === d)*/);
	}
}
