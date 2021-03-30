import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, defaultEmojis, EmbedBuilder } from "core";
import { Stats, ShardStats } from "eris-fleet";
import { Strings } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["shards"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		// typescript being dumb
		const st: Stats = await this.ipc.getStats();
		const sh = st.clusters.reduce((a,b) => a.concat(b.shardStats), [] as Array<ShardStats>);
		const d: Array<number> = [];
		// lib sucks
		for (const s of sh) {
			if (d.includes(s.id)) sh.splice(sh.indexOf(s), 1);
			else d.push(s.id);
		}

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.desc}`)
				.addFields(...sh.map(s => ({
					name: `${s.id === msg.channel.guild.shard.id ? "(\\*)" : ""} {lang:other.words.shard$ucwords$} #${s.id}`,
					value: [
						`{lang:other.words.status$ucwords$}: ${Strings.ucwords(s.status)}`,
						`{lang:other.words.latency$ucwords$}: ${defaultEmojis.circle[s.latency <= 100 ? "green" : s.latency <= 300 ? "yellow" : "red"]} **${s.latency}ms**`,
						`{lang:other.words.servers$ucwords$}: ${s.guilds}`
					].join("\n"),
					inline: true
				})))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setFooter(`{lang:${cmd.lang}.average|${Math.abs(Math.floor(sh.reduce((a, b) => a + b.latency, 0) / sh.length))}ms}`, this.bot.user.avatarURL)
				.toJSON()
		});
	});
