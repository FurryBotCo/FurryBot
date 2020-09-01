import { mdb } from "./Database";

type Blacklist = {
	type: string;
	expiry?: number;
	blame: string;
	reason: string;
} & ({
	type: "user";
	userId: string;
} | {
	type: "guild";
	guildId: string;
});

export default class BlacklistUtility {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	async checkBlacklist(type: Blacklist["type"], id: string) {
		const d = Date.now();
		const b = await mdb.collection("blacklist").find<Blacklist>({
			type,
			...(type === "user" ? ({ userId: id }) : ({ guildId: id }))
		}).toArray();

		const entires = {
			current: b.filter(e => !e.expiry || e.expiry > d),
			expired: b.filter(e => e.expiry && e.expiry < d)
		};

		return {
			active: entires.current.length > 0,
			entires
		};
	}
}
