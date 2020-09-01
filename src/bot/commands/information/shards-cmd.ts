import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import Strings from "../../../util/Functions/Strings";
import config from "../../../config";
import Language from "../../../util/Language";

export default new Command(["shards"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(2e3, true)
	.setExecutor(async function (msg, cmd) {
		const st = await this.ipc.getStats();
		if (!st) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.noStats"));
		if (msg.args.length === 0) {
			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription(`{lang:${cmd.lang}.desc}`)
					.addFields(...Array.from(st.shards.values()).map((s, i) => ({
						name: `${i === msg.channel.guild.shard.id ? "(\\*)" : ""} {lang:other.words.shard$ucwords$} ${i}`,
						value: [
							`{lang:other.words.status$ucwords$}: ${Strings.ucwords(s.status)}`,
							`{lang:other.words.latency$ucwords$}: ${s.latency}ms`,
							`{lang:other.words.servers$ucwords$}: ${s.guilds}`
						].join("\n"),
						inline: true
					})))
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.gold)
					.setFooter(`{lang:${cmd.lang}.average|${Math.abs(Math.floor(Array.from(st.shards.values()).reduce((a, b) => a + b.latency, 0) / st.shards.size))}ms}`, this.bot.user.avatarURL)
					.toJSON()
			});
		} else {
			if (!config.developers.includes(msg.channel.guild.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnly`));
			const s = Number(msg.args[2]);
			if (isNaN(s)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidShard`));
			switch (msg.args[0]?.toLowerCase()) {
				case "restart": {
					this.bot.shards.get(s).disconnect({ reconnect: true });
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.shardRestarted`, [s]));
					break;
				}

				default: return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidSub`));
			}
		}
	});
