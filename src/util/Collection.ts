// copied from https://github.com/auguwu/immutable/blob/master/src/Collection.ts
const names: { [x in "collection" | "queue"]: string } = {
	collection: "Collection",
	queue: "Queue"
};

class ImmutabilityError extends Error {
	constructor(type: "collection" | "queue", func: string) {
		super(`${names[type]} is immutable, values cannot be changed. (Called by ${names[type]}#${func})`);

		this.name = "ImmutabilityError";
	}
}

type NormalObject<T> = Record<string | number | symbol, T>;

/**
 * Utility check to see if it"s an object
 * @param obj The object iself
 * @returns a boolean check
 * @credit [KurozeroPB](https://github.com/KurozeroPB/Collection/blob/master/src/utils.ts#L1)
 */
const isObject = <S>(obj: NormalObject<S>) => {
	let old = obj;
	return (typeof obj !== "object" || obj === null ? false : (() => {
		while (!false) {
			if (Object.getPrototypeOf(old = Object.getPrototypeOf(old)) === null) break;
		}

		return Object.getPrototypeOf(obj) === old;
	})());
};

/**
 * The `Collection` immutable object
 */
export default class Collection<T = any> extends Map<string | number | BigInt, T> {
	/** Checks if this Collection is mutable (values can be added) or not */
	public mutable: boolean;

	/**
	 * Creates a new instance of the `Collection` immutable class
	 * @param from Any values to add
	 */
	constructor(from?: T[] | NormalObject<T>) {
		super();

		this.mutable = true;

		if (from) {
			if (Array.isArray(from)) {
				for (let i = 0; i < from.length; i++) this.set(i, from[i]);
			} else if (isObject(from)) {
				for (const [prop, value] of Object.entries(from)) this.set(prop, value);
			} else {
				throw new TypeError(`"from" expects to be an Object or Array, received ${typeof from}`);
			}
		}
	}

	/** Getter if the collection is empty */
	get empty() {
		return this.size === 0;
	}

	/**
	 * Adds a value to the collection without using a key
	 * @param val The value to add to the collection
	 */
	add(val: T) {
		if (!this.mutable) throw new ImmutabilityError("collection", "add");
		this.set(this.size, val);
	}

	/**
	 * Use a predicate function to filter out anything and return a new Array
	 * @param predicate The predicate function to filter out
	 * @returns A new Array of the values that returned `true` in the predicate function
	 */
	filter(predicate: (this: Collection<T>, item: T) => boolean) {
		const result: T[] = [];
		for (const value of this.values()) {
			const func = predicate.bind(this);
			if (func(value)) result.push(value);
		}

		return result;
	}

	/**
	 * Use a predicate function to map anything into a new array
	 * @param predicate The predicate function to map out and return a new array
	 * @returns A new Array of the values from that function
	 */
	map<S>(predicate: (this: Collection<T>, item: T) => S) {
		const result: S[] = [];
		const func = predicate.bind(this);

		for (const value of this.values()) result.push(func(value));

		return result;
	}

	/**
	 * Returns a random value from the collection
	 * @returns A random value or `null` if the collection is empty
	 */
	random() {
		if (this.empty) return null;
		const iterable = Array.from(this.values());

		return iterable[Math.floor(Math.random() * iterable.length)];
	}

	/**
	 * Merges all collections provided and this one to a new collection
	 * @param collections Any collections to merge into this one
	 */
	merge(...collections: Collection<any>[]) {
		if (collections.some(x => !x.mutable)) {
			const immutable = collections.filter(x => !x.mutable);
			throw new Error(`${immutable.length} collections cannot be merged due to some being immutable.`);
		}

		const newColl = new Collection<T>();
		for (const [key, value] of this) newColl.set(key, value);

		for (const coll of collections) {
			for (const [key, val] of coll) newColl.set(key, val);
		}

		return newColl;
	}

	/**
	 * Paritition the collection and return an Array of 2 collections that returned `true` or `false`
	 * @param predicate The predicate function
	 * @returns An array with 2 collections that represent a `true (first one)` and `false (second one)`
	 */
	partition(predicate: (this: Collection<T>, item: T) => boolean): [Collection<T>, Collection<T>] {
		const [item1, item2]: [Collection<T>, Collection<T>] = [new Collection(), new Collection()];
		for (const [key, value] of this) {
			const func = predicate.bind(this);
			const result = func(value);

			if (result) item1.set(key, value);
			else item2.set(key, value);
		}

		return [item1, item2];
	}

	/**
	 * Reduce the collection and return a new initial value
	 * @param predicate The predicate function
	 * @param initialValue The initial value
	 */
	reduce<S>(predicate: (this: Collection<T>, a: S, b: T) => S, initialValue?: S) {
		const iterable = this.values();
		let value!: T;
		let res: S = initialValue === undefined ? iterable.next().value : initialValue;

		const func = predicate.bind(this);
		while ((value = iterable.next().value) !== undefined) res = func(res, value);

		return res;
	}

	/**
	 * Returns the first element in the collection
	 */
	first(): T | undefined;

	/**
	 * Returns an Array of the values from the correspondant `amount`
	 * @param amount The amount to fetch from
	 */
	first(amount: number): T[];

	/**
	 * Returns the first element in the collection or an Array of the values from the correspondant `amount`
	 * @param amount The amount to fetch from
	 */
	first(amount?: number): T | T[] | undefined {
		if (typeof amount === "undefined") {
			const iterable = this.values();
			return iterable.next().value;
		}

		if (amount < 0) return this.last(amount! * -1);
		amount = Math.min(amount, this.size);

		const iterable = this.values();
		return Array.from({ length: amount }, (): T => iterable.next().value);
	}

	/**
	 * Returns the last element in the collection
	 */
	last(): T | undefined;

	/**
	 * Returns an Array of the values from the correspondant `amount`
	 * @param amount The amount to fetch from
	 */
	last(amount: number): T[];

	/**
	 * Returns the last element in the collection or an Array of the values from the correspondant `amount`
	 * @param amount The amount to fetch from
	 */
	last(amount?: number): T | T[] | undefined {
		const iter = [...this.values()];
		if (typeof amount === "undefined") return iter[iter.length - 1];
		if (amount < 0) return this.first(amount! * -1);
		if (!amount) return [];

		return iter.slice(-amount);
	}

	/**
	 * Find a value in the collection from it"s predicate function
	 * @param predicate The predicate function
	 * @returns The value found or `null` if not found
	 */
	find(predicate: (this: Collection<T>, item: T) => boolean) {
		let result: T | null = null;
		for (const value of this.values()) {
			const find = predicate.bind(this);
			if (find(value)) result = value;
		}

		return result;
	}

	/**
	 * Deletes all elements from the collection
	 */
	deleteAll() {
		if (!this.mutable) throw new ImmutabilityError("collection", "deleteAll");
		for (const key of this.keys()) this.delete(key);
	}

	/** Overriden from `Map#delete` */
	delete(key: string | number | BigInt) {
		if (!this.mutable) throw new ImmutabilityError("collection", "delete");
		return super.delete(key);
	}

	/** Overriden from `Map#set` */
	set(key: string | number | BigInt, value: T) {
		if (!this.mutable) throw new ImmutabilityError("collection", "set");
		return super.set(key, value);
	}

	/** Make this class immutable */
	freeze() {
		this.mutable = false;
		Object.freeze(this);
		Object.freeze(this.constructor);
	}

	/** Makes this class mutable and returns a new collection of the copied values of this immutable collection */
	unfreeze() {
		// There is no "way" that this can be unfrozed, so we make a
		// new collection for safety precautions
		const collection = new (this.constructor as typeof Collection)<T>();
		for (const [key, value] of this) collection.set(key, value);

		return collection;
	}

	/**
	 * Build a new Collection with(out) initial values
	 * @param values The values to add
	 */
	static from<V>(values: V[] | NormalObject<V>) {
		const collection = new Collection<V>();
		if (Array.isArray(values)) {
			for (let i = 0; i < values.length; i++) collection.set(i, values[i]);
		} else if (isObject(values)) {
			for (const [key, value] of Object.entries(values)) collection.set(key, value);
		} else {
			throw new TypeError(`Collection#from requires the values to be an Object or Array, received ${typeof values}`);
		}

		return collection;
	}

	/**
	 * Override function to return this as a String
	 */
	toString() {
		const getKindOf = (element: T) => {
			if (element === undefined) return "undefined";
			if (element === null) return "null";
			if (!["object", "function"].includes(typeof element)) return (typeof element);
			if (element instanceof Array) return "array";

			return {}.toString.call(element).slice(8, -2);
		};

		const all: string[] = [];
		this.map(getKindOf).filter((item) => {
			if (!all.includes(item)) all.push(item);
		});

		return `Collection<${all.join(" | ")}>`;
	}
}
