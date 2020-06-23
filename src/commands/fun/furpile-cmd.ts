import Command from "../../modules/CommandHandler/Command";
import Eris from "eris";
import config from "../../config";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"furpile"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const h = this.holder.has("furpile", msg.channel.id);

	if (h && msg.args.length === 0) {
		const c = this.holder.get<string[]>("furpile", msg.channel.id);
		const t = this.holder.get<NodeJS.Timeout>("furpile", `${msg.channel.id}.timeout`);
		clearTimeout(t);
		if (c.includes(msg.author.id) && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.fun.furpile.alreadyPresent}");
		this.holder.add("furpile", msg.channel.id, msg.author.id);
		this.holder.set("furpile", `${msg.channel.id}.timeout`, setTimeout((ch: Eris.GuildTextableChannel) => { this.holder.remove("furpile", ch.id); this.holder.remove("furpile", `${ch.id}.timeout`); }, 18e5, msg.channel));
		return msg.channel.createMessage(`{lang:commands.fun.furpile.join|${msg.author.id}|${c.length}|${c.length + 1}|${gConfig.settings.prefix}}`);
	} else {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const m = await msg.getMemberFromArgs();
		if (!m) return msg.errorEmbed("INVALID_MEMBER");
		if (m.id === msg.author.id) return msg.reply("{lang:commands.fun.furpile.noSelf}");
		this.holder.set("furpile", msg.channel.id, []);
		this.holder.add("furpile", msg.channel.id, msg.author.id);
		this.holder.add("furpile", msg.channel.id, m.id);
		this.holder.set("furpile", `${msg.channel.id}.timeout`, setTimeout((ch: Eris.GuildTextableChannel) => { this.holder.remove("furpile", ch.id); this.holder.remove("furpile", `${ch.id}.timeout`); }, 18e5, msg.channel));
		await msg.channel.createMessage(`{lang:commands.fun.furpile.start|${msg.author.id}|${m.id}|${gConfig.settings.prefix}}`);
	}
}));
