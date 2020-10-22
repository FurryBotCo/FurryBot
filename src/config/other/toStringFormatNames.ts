import Eris from "eris";

const obj = new (class StringFormatNames {
	values: {
		test<T>(obj: T): boolean;
		props: string[];
	}[];
	constructor() {
		this.values = [];
	}

	add(test: <T>(obj: T) => boolean, props: string[]) {
		this.values.push({
			test,
			props
		});

		return this;
	}
})();

obj
	.add((obj) => obj instanceof Error, ["name", "message"])
	.add((obj) => obj instanceof EvalError, ["name", "message", "code"])
	.add((obj) => obj instanceof Eris.Guild, ["id", "name", "icon", "splash", "banner", "region", "ownerID", "memberCount", "large", "shard"])
	.add((obj) => obj instanceof Eris.Member, ["id", "username", "discriminator", "avatar", "bot", "nick", "status"])
	.add((obj) => obj instanceof Eris.User, ["id", "username", "discriminator", "avatar", "bot", "system"])
	.add((obj) => obj instanceof Eris.Shard, ["id", "latency", "status"])
	.add((obj) => obj instanceof Eris.Message, ["id", "author", "channel", "content", "flags", "mentionEveryone", "pinned", "timestamp", "tts", "type"])
	.add((obj) => obj instanceof Eris.Role, ["id", "name", "color", "guild", "host", "mentionable", "managed", "position"])
	.add((obj) => obj instanceof Eris.Channel, ["id", "name", "guild", "parentID", "nsfw", "position", "type"]);

export default obj.values;
