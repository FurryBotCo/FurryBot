

export default class HolderV2 {
	entries: {
		name: string;
		added: number;
		time: number;
	}[];
	private i: NodeJS.Timeout;
	constructor() {
		this.entries = [];
		this.i = setInterval(() => {
			const d = Date.now();
			for (const e of this.entries) if (!!e.time && e.added + e.time > d) this.entries.splice(this.entries.indexOf(e), 1);
		}, 1e3);
	}

	add(name: string, time?: number) {
		const added = Date.now();
		if (this.entries.filter(e => e.name.toLowerCase() === name.toLowerCase()).length !== 0) throw new TypeError("Duplicate entry.");
		this.entries.push({
			name,
			added,
			time
		});
		return true;
	}

	remove(name: string) {
		if (this.entries.filter(e => e.name.toLowerCase() === name.toLowerCase()).length === 0) throw new TypeError("Entry not found.");
		this.entries.splice(this.entries.indexOf(this.entries.find(e => e.name.toLowerCase() === name.toLowerCase())), 1);
		return true;
	}

	check(name: string) {
		if (this.entries.filter(e => e.name.toLowerCase() === name.toLowerCase()).length !== 0) return true;
		else return false;
	}
}
