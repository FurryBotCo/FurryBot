import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";

export default new Command({
	triggers: [
		"awoo"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const h = this.holder.has("awoo", msg.channel.id);

	if (h) {
		const c = this.holder.get<string[]>("awoo", msg.channel.id);
		const t = this.holder.get<NodeJS.Timeout>("awoo", `${msg.channel.id}.timeout`);
		clearTimeout(t);
		if (c.includes(msg.author.id) && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.fun.awoo.alreadyPresent}");
		this.holder.add("awoo", msg.channel.id, msg.author.id);
		this.holder.set("awoo", `${msg.channel.id}.timeout`, setTimeout((ch: Eris.GuildTextableChannel) => { this.holder.remove("awoo", ch.id); this.holder.remove("awoo", `${ch.id}.timeout`); }, 18e5, msg.channel));
		return msg.channel.createMessage(`{lang:commands.fun.awoo.join|${msg.author.id}|${c.length + 1}|${gConfig.settings.prefix}|${c.length + 1 > 30 ? "{lang:commands.fun.awoo.tooLarge}" : config.emojis.awoo.repeat(c.length + 1)}}`);
	} else {
		this.holder.add("awoo", msg.channel.id, msg.author.id);
		this.holder.set("awoo", `${msg.channel.id}.timeout`, setTimeout((ch: Eris.GuildTextableChannel) => { this.holder.remove("awoo", ch.id); this.holder.remove("awoo", `${ch.id}.timeout`); }, 18e5, msg.channel));
		await msg.channel.createMessage(`{lang:commands.fun.awoo.start|${msg.author.id}|${gConfig.settings.prefix}|${config.emojis.awoo}}`);
	}
}));
