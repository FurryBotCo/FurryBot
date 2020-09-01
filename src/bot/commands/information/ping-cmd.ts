import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";

export default new Command(["ping"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		let create: number, edit: number, del: number;
		await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.calculating`))
			.then(m => (create = m.timestamp, m.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.calculated`))))
			.then(async (m) => {
				edit = m.editedTimestamp;
				await m.delete().then(() => del = Date.now());
				const st = await this.ipc.getStats();
				const c = await this.ipc.evalAtMaster<"pong">("'pong'"); // too lazy to make a real ping
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setDescription([
							`{lang:${cmd.lang}.generalTime}: **${Math.abs(Math.floor(create - msg.timestamp))}ms**`,
							`{lang:${cmd.lang}.editTime}: **${Math.abs(Math.floor(edit - create))}ms**`,
							`{lang:${cmd.lang}.deleteTime}: **${Math.abs(Math.floor(del - create))}ms**`,
							`{lang:${cmd.lang}.clusterTime|${this.cluster.id}}: **${c.time}ms**`,
							`{lang:${cmd.lang}.shardTime|${msg.channel.guild.shard.id + 1}}: **${Math.abs(Math.floor(msg.channel.guild.shard.latency))}ms**`,
							`{lang:${cmd.lang}.shardAverage|${st.shards.size}}: **${Math.abs(Math.floor(Array.from(st.shards.values()).reduce((a, b) => a + b.latency, 0) / st.shards.size))}ms**`
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setFooter("\u200b", this.bot.user.avatarURL)
						.setColor(Colors.gold)
						.toJSON()
				});
			});
	});
