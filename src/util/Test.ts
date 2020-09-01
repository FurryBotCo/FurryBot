import FurryBot from "../bot";
import ExtendedMessage from "./ExtendedMessage";
import Command from "./cmd/Command";

class SpecificTest<N extends string> {
	#t: Test;
	#name: N;
	constructor(t: Test, name: N) {
		this.#t = t;
		this.#name = name;
	}

	execute<T = any>(...args: Parameters<Test["tests"][string]>) { return this.#t.executeTest<T>(this.#name, ...args); }
	delete() { return this.#t.deleteTest(this.#name); }
}

export default class Test {
	// I would use a map but I don't know how to easily
	// pull V out of Map<K, V> without defining V elsewhere
	#tests: {
		[k: string]: <T = any>(client: FurryBot, msg: ExtendedMessage, cmd: Command) => Promise<T>;
	};
	constructor() {
		this.#tests = {};
	}
	get tests() { return this.#tests; }

	registerTest<T = any>(name: string, test: (...args: Parameters<Test["tests"][string]>) => Promise<T>) {
		if (this.tests[name]) throw new TypeError(`Duplicate test "${name}"`);
		this.tests[name] = test as any;
		return true;
	}

	executeTest<T = any>(name: string, ...args: Parameters<Test["tests"][string]>): Promise<T> {
		if (!this.tests[name]) throw new TypeError(`Invalid test "${name}"`);
		return this.tests[name].call(null, ...args);
	}

	deleteTest(name: string) {
		if (!this.tests[name]) throw new TypeError(`Invalid test "${name}"`);
		delete this.#tests[name];
		return true;
	}

	// generics for no reason™️
	getTest<N extends string>(name: N) {
		if (!this.tests[name]) return null;

		return new SpecificTest(this, name);
	}
}
