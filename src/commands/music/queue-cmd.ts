import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { Time } from "../../util/Functions";
import chunk from "chunk";
import MusicQueue from "../../util/MusicQueue";

export default new Command({
	triggers: [
		"queue"
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
	const q: MusicQueue = this.q.get(msg.channel.guild.id);
	if (!q) return msg.reply("{lang:commands.music.queue.nothing}");
	const c = q.entries.current;
	const pages = chunk(q.entries.queue, 10);
	const page = msg.args.length === 0 ? 1 : Number(msg.args[0]);

	if ((isNaN(page) || page > pages.length) && !(page === 1 && pages.length === 0)) return msg.reply(`{lang:commands.music.queue.invalidPage|${msg.args[0]}|${pages.length || 1}}`);
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.music.queue.embed.title}")
			.setDescription([
				`{lang:commands.music.queue.embed.nowPlaying|${c.info.title}|${c.addedBy}|${Time.ms(c.info.length, true)}}`,
				"",
				"{lang:commands.music.queue.embed.queue}:",
				!pages[page - 1] || pages[page - 1].length === 0 ? "{lang:commands.music.queue.embed.noEntries}" : pages[page - 1].map((e, i) => `{lang:commands.music.queue.embed.entry|${(i + 1) + (page - 1) * 10}|${e.info.title}|https://www.youtube.com/watch?v=${e.info.identifier}|${e.addedBy}}`).join("\n")
			].join("\n"))
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
			.setFooter(`{lang:commands.music.queue.embed.footer|${page}|${pages.length}}`)
			.toJSON()
	});
}));
