import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { Time } from "../../util/Functions";
import Language from "../../util/Language";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"play",
		"p"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [
		"developer"
	],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
	if (!msg.member.voiceState || !msg.member.voiceState.channelID) return msg.reply("{lang:other.music.joinVC}");
	if (!!(msg.channel.guild.me.voiceState && msg.channel.guild.me.voiceState.channelID) && msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID) return msg.reply("{lang:other.music.wrongVC}");
	const q = this.getQueue(msg.channel.guild.id, msg.channel.id, msg.member.voiceState.channelID);
	const s = await q.search("youtube", msg.args.join(" ")).then(j => j.slice(0, 10));
	if (!s || s.length === 0) return msg.reply(`{lang:commands.music.play.noResults|${msg.args.join(" ")}}`);

	const m = await msg.channel.createMessage({
		content: "{lang:commands.music.play.select.content}",
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTitle("{lang:commands.music.play.select.title}")
			.setDescription(s.map((t, i) => `#${i + 1} - [${t.info.title}](https://www.youtube.com/watch?v=${t.info.identifier})`).join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.toJSON()
	});
	const d = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
	const c = !d ? NaN : Number(d.content);
	if (!d || isNaN(c)) return msg.reply("{lang:commands.music.play.select.canceled}");

	if (c < 1 || c > s.length) return msg.reply(`{lang:commands.music.play.select.invalidPage|${c}|${s.length}}`);
	const t = s[c];
	await m.edit({
		content: "",
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTitle("{lang:commands.music.play.addedEmbed.title}")
			.setDescription(`{lang:commands.music.play.addedEmbed.description|${t.info.title}|${Time.ms(t.info.length, true)}|${q.entries.length === 0 ? Language.get(gConfig.settings.lang, "other.words.now") : Time.ms(q.entries.reduce((a, b) => a + b.info.length, 0))}}`)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.toJSON()

	});
	await q.add(t, msg.author.id, q.entries.length === 0);
}));
