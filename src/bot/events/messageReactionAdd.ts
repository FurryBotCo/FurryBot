import ClientEvent from "../../util/ClientEvent";
import config from "../../config";
import Eris from "eris";

export default new ClientEvent("messageReactionAdd", async function (message, emoji) {
	let m: Eris.Message;
	if (!message["author"]) return; // tslint:disable-line no-string-literal
	/*if (!message["author"]) { // tslint:disable-line no-string-literal
		let ch = this.bot.guilds.map(g => g.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as any))).reduce((a, b) => a.concat(b), [] as Eris.GuildTextableChannel[]).find(c => c.id === message.channel.id) as Eris.GuildTextableChannel;
		if (!ch) ch = await this.bot.getRESTChannel(message.channel.id).catch(err => null) as Eris.GuildTextableChannel;
		if (!ch) return; // invalid channel & can't determine where it came from
		m = await ch.getMessage(message.id).catch(err => null);
		if (!m) return; // can't find message
	} else*/ m = message as any;

	const e = Object.values(config.emojis.default.numbers);
	if (e.includes(emoji.name)) {
		let o;
		Object.values(config.emojis.default.numbers).find((e, i) => e === emoji.name ? o = i : null);
		this.p.addReaction(m.id, m.author.id, o);
	}
});
