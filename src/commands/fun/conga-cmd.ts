import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import Eris from "eris";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"conga"
	],
	userPermissions: [],
	botPermissions: [
		"externalEmojis"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const h = this.holder.has("conga", msg.channel.id);

	if (h && msg.args.length === 0) {
		const c = this.holder.get<string[]>("conga", msg.channel.id);
		const t = this.holder.get<NodeJS.Timeout>("conga", `${msg.channel.id}.timeout`);
		clearTimeout(t);
		if (c.includes(msg.author.id) && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.fun.conga.alreadyPresent}");
		this.holder.add("conga", msg.channel.id, msg.author.id);
		this.holder.set("conga", `${msg.channel.id}.timeout`, setTimeout((ch: Eris.GuildTextableChannel) => { this.holder.remove("conga", ch.id); this.holder.remove("conga", `${ch.id}.timeout`); }, 18e5, msg.channel));
		return msg.channel.createMessage(`{lang:commands.fun.conga.join|${msg.author.id}|${c.length + 1}|${gConfig.settings.prefix}|${c.length + 1 > 30 ? Language.parseString(gConfig.settings.lang, "{lang:commands.fun.conga.tooLarge}") : `<a:${config.emojis.conga}>`.repeat(c.length + 1)}}`);
	} else {
		if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
		const m = await msg.getMemberFromArgs();
		if (!m) return msg.errorEmbed("INVALID_MEMBER");
		if (m.id === msg.author.id) return msg.reply("{lang:commands.fun.conga.noSelf}");
		this.holder.set("conga", msg.channel.id, []);
		this.holder.add("conga", msg.channel.id, msg.author.id);
		this.holder.set("conga", `${msg.channel.id}.timeout`, setTimeout((ch: Eris.GuildTextableChannel) => { this.holder.remove("conga", ch.id); this.holder.remove("conga", `${ch.id}.timeout`); }, 18e5, msg.channel));
		await msg.channel.createMessage(`{lang:commands.fun.conga.start|${msg.author.id}|${m.id}|${gConfig.settings.prefix}|<a:${config.emojis.conga}>}`);
	}
}));
