export default class Collection<V> extends Map<string, V> {
	constructor() {
		super();
	}

	addFromArray(...items: (V & { id: string; })[]) {
		items.map(i => {
			const e = { ...i };
			delete e.id;
			return super.set(i.id, e);
		});
		return this;
	}
}
