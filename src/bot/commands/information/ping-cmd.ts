import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import { EVAL_CODES } from "../../../clustering/Constants";

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
				await msg.channel.sendTyping();
				edit = m.editedTimestamp;
				await m.delete().then(() => del = Date.now());
				const sh: Clustering.ShardStats[] = await this.ipc.getStats().then(v => v.shards && v.shards.size > 0 ? Array.from(v.shards?.values()) : this.bot.shards.map(s => ({
					latency: s.latency,
					lastHeartbeatReceived: s.lastHeartbeatReceived,
					lastHeartbeatSent: s.lastHeartbeatSent,
					status: s.status,
					guilds: this.bot.guilds.filter(g => g.shard.id === s.id).length,
					largeGuilds: this.bot.guilds.filter(g => g.large && g.shard.id === s.id).length,
					channels: this.bot.guilds.filter(g => g.shard.id === s.id).reduce((a, b) => a + b.channels.size, 0)
				}) as Clustering.ShardStats));
				const c = await this.ipc.evalAtMaster<"pong">("'pong'"); // too lazy to make a real ping
				const cl = [];
				for (let i = 0; i < this.cluster.options.clusterCount; i++) {
					if (i === this.cluster.id) continue;
					const t = await this.ipc.evalAtCluster<"pong">(i, "'pong'");
					let r: string;
					switch (t.code) {
						case EVAL_CODES.SUCCESS: r = `${t.time}ms`; break;
						case EVAL_CODES.NOT_READY: r = Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notReadyYet`); break;
						case EVAL_CODES.NO_RESPONSE: r = Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noResponse`); break;
						default: r = Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unknown`);
					}
					cl.push(`{lang:${cmd.lang}.toCluster|${this.cluster.id + 1}|${i + 1}|${r}}`);
				}
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setDescription([
							`{lang:${cmd.lang}.generalTime}: **${Math.abs(Math.floor(create - msg.timestamp))}ms**`,
							`{lang:${cmd.lang}.editTime}: **${Math.abs(Math.floor(edit - create))}ms**`,
							`{lang:${cmd.lang}.deleteTime}: **${Math.abs(Math.floor(del - create))}ms**`,
							`{lang:${cmd.lang}.clusterTime|${this.cluster.id}}: **${c.time}ms**`,
							...cl,
							`{lang:${cmd.lang}.shardTime|${msg.channel.guild.shard.id + 1}}: **${Math.abs(Math.floor(msg.channel.guild.shard.latency))}ms**`,
							`{lang:${cmd.lang}.shardAverage|${sh.length}}: **${Math.abs(Math.floor(sh.reduce((a, b) => a + b.latency, 0) / sh.length))}ms**`
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setFooter("OwO", this.bot.user.avatarURL)
						.setColor(Colors.gold)
						.toJSON()
				});
			});
	});
