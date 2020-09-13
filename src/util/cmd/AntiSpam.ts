import FurryBot from "../../bot";

interface CommandEntry {
	time: number;
	user: string;
	type: "command";
	command: string;
}

export default class AntiSpam {
	client: FurryBot;
	private entries: (CommandEntry)[];
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
	add(user: string, type: "command", d: string) {
		const time = Date.now();
		this.entries.push({
			time,
			user,
			type,
			...(type === "command" ? ({ command: d }) : {}) as any
		});
		return this;
	}

	get(user: string, type: "command"): CommandEntry[];
	get(user: string, type: "command"): (CommandEntry)[] {
		return this.entries.filter(e => e.user === user && e.type === type/* && (type === "command" && (e as any).command === d) || (type === "autoResponse" && (e as any).autoResponse === d)*/);
	}
}
