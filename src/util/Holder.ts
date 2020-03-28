export default class Holder {
	entries: Map<string, Map<string, any> | any>;
	constructor() {
		this.entries = new Map();
	}

	get<T = any>(type: string): Map<string, T> | T;
	get<T = any>(type: string, sub: string): T;
	get<T = any>(type: string, sub?: string): Map<string, T> | T | T[] {
		if (!this.entries.has(type)) return null;
		if (!sub) return this.entries.get(type);

		if (!this.entries.get(type).has(sub)) return null;
		return this.entries.get(type).get(sub);
	}



	add<T = any>(type: string, sub: string, value: T): boolean;
	add<T = any>(type: string, sub: string, value: T) {
		if (!!sub) {
			if (!this.entries.has(type)) this.entries.set(type, new Map());
			if (this.entries.get(type).has(sub)) {
				const t = this.get<T[]>(type, sub);
				if (value instanceof Array) this.entries.get(type).set(sub, [...t, ...value]);
				else this.entries.get(type).set(sub, [...t, value]);
			} else {
				if (value instanceof Array) this.entries.get(type).set(sub, value);
				else this.entries.get(type).set(sub, [value]);
			}
		} else {
			if (this.entries.has(type)) {
				const t = this.get<T[]>(type);
				if (value instanceof Array) this.entries.set(type, [...t, ...value]);
				else this.entries.set(type, [...t, value]);
			} else {
				if (value instanceof Array) this.entries.set(type, value);
				else this.entries.set(type, [value]);
			}
		}
		return true;
	}

	set<T = any>(type: string, sub: null, value: T): boolean;
	set<T = any>(type: string, sub: string, value?: T): boolean;
	set<T = any>(type: string, sub?: string, value?: T): boolean;
	set<T = any>(type: string, sub?: string, value?: T) {
		if (!!sub) {
			if (!this.entries.has(type)) this.entries.set(type, new Map());
			this.entries.get(type).set(sub, value);
		} else this.entries.set(type, value);
		return true;
	}

	remove<T = any>(type: string, sub?: string, value?: T) {
		if (!this.entries.has(type)) return false;
		if (!!sub) {
			if (!this.entries.get(type).has(sub)) return false;
			if (!!value) {
				const t = this.get<T[]>(type, sub);
				if (t.indexOf(value) === -1) return false;
				t.splice(t.indexOf(value));
				this.set(type, sub, t);
			} else (this.get<any>(type) as Map<string, any>).delete(sub);
		} else {
			if (!!value) {
				const t = this.get<T[]>(type) as T[];
				if (t.indexOf(value) === -1) return false;
				t.splice(t.indexOf(value), 1);
				this.set(type, null, t);
			} else this.entries.delete(type);
		}
		return true;
	}

	clear(type: string, sub?: string) {
		if (!this.entries.has(type)) return false;
		if (!!sub) {
			if (!this.entries.get(type).has(sub)) return false;
			else this.entries.get(type).delete(sub);
		}
		else this.entries.get(type).clear();
		return true;
	}

	has<T = any>(type: string, sub?: string, value?: T) {
		if (!this.entries.has(type)) return false;
		if (!!value) {
			if (!sub) return this.entries.get(type).includes(value);
			else return this.entries.get(type).get(sub).includes(value);
		}
		if (!sub) return true;
		return this.entries.get(type).has(sub);
	}
}
