import ClientEvent from "../util/ClientEvent";
import config from "../config";
import Eris from "eris";

export default new ClientEvent("messageReactionAdd", async function (message, emoji) {
	const m = message as unknown as Eris.Message;
	// eslint-disable-next-line @typescript-eslint/dot-notation
	if (!message["author"]) return;

	const e = Object.values(config.emojis.default.numbers);
	if (e.includes(emoji.name)) {
		let o;
		Object.values(config.emojis.default.numbers).find((e, i) => e === emoji.name ? o = i : null);
		this.p.addReaction(m.id, m.author.id, o);
	}

	if (config.developers.includes((message as Eris.Message).author.id)) {
		// if(emoji.name === "❌" )
	}
});
