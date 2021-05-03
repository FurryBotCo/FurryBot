export interface DeleteSnipe {
	type: "delete";
	content: string;
	author: string;
	time: string;
	ref: null | {
		link: string;
		author: string;
		content: string;
	};
}

export interface EditSnipe {
	type: "edit";
	newContent: string;
	oldContent: string;
	author: string;
	time: string;
}

type GetData<A, B> = A extends { type: B; } ? A : never;

export type AnySnipe = DeleteSnipe | EditSnipe;

// I plan on making this static at some point
export default class SnipeHandler {
	static list = new Map<string, Array<AnySnipe>>();

	static add<T extends AnySnipe["type"]>(type: T, channel: string, data: Omit<GetData<AnySnipe, T>, "type">) {
		if (!this.list.has(channel)) this.list.set(channel, []);
		let v = this.list.get(channel)!.push({
			...data,
			type
		} as GetData<AnySnipe, T>);
		if (v >= 4) {
			this.removeLast(type, channel);
			v--;
		}
		return v;
	}

	static removeLast<T extends AnySnipe["type"]>(type: T, channel: string) {
		const j = this.list.get(channel)!;
		const [l] = j.filter(({ type: t }) => t === type);
		if (!l) return null;
		return (j.splice(j.indexOf(l), 1))[0] as GetData<AnySnipe, T>;
	}

	static removeAll<T extends AnySnipe["type"]>(type: T | null | undefined, channel: string) {
		if (type) this.list.get(channel)!.filter(({ type: t }) => t === type).map((v, i, arr) => this.list.get(channel)!.splice(arr.indexOf(v), 1));
		if (this.list.get(channel)!.length === 0 || !type) this.list.delete(channel);
	}

	static get<T extends AnySnipe["type"]>(type: T, channel: string) {
		return !this.list.has(channel) ? [] : this.list.get(channel)!.filter(({ type: t }) => t === type) as Array<GetData<AnySnipe, T>>;
	}

	static getAll(channel: string) {
		return this.list.get(channel) ?? [];
	}
}
