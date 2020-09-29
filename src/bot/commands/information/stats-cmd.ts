import Command from "../../../util/cmd/Command";
import { performance } from "perf_hooks";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import Language from "../../../util/Language";
import Strings from "../../../util/Functions/Strings";
import Redis from "../../../util/Redis";

export default new Command(["stats"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const start = performance.now();
		const stats = await this.sh.getStats();
		const r: {
			total_connections_received: number;
			total_commands_processed: number;
			instantaneous_ops_per_sec: number;
			total_net_input_bytes: number;
			total_net_output_bytes: number;
			instantaneous_input_kbps: number;
			instantaneous_output_kbps: number;
			rejected_connections: number;
			sync_full: number;
			sync_partial_ok: number;
			sync_partial_err: number;
			expired_keys: number;
			expired_stale_perc: number;
			expired_time_cap_reached_count: number;
			evicted_keys: number;
			keyspace_hits: number;
			keyspace_misses: number;
			pubsub_channels: number;
			pubsub_patterns: number;
			latest_fork_usec: number;
			migrate_cached_sockets: number;
			slave_expires_tracked_keys: number;
			active_defrag_hits: number;
			active_defrag_misses: number;
			active_defrag_key_hits: number;
			active_defrag_key_misses: number;
		} = await Redis.info("stats").then(v => v.split(/\n\r?/).slice(1, -1).map(s => ({
			[s.split(":")[0]]: Number(s.split(":")[1])
		})).reduce((a, b) => ({ ...a, ...b }), {})) as unknown as any;

		const end = performance.now();

		const e = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setFooter(`{lang:${cmd.lang}.footer|${(end - start).toFixed(3)}}`, this.bot.user.avatarURL);

		if (msg.args.length === 0) {
			e
				.setTitle(`{lang:${cmd.lang}.titleGeneral}`)
				.addField("{lang:other.words.messages$ucwords$}", [
					"{lang:other.words.server$ucwords$} {lang:other.words.messages$ucwords$}",
					`{lang:other.words.total$ucwords$}: **${stats.messages.general.toLocaleString()}**`,
					`{lang:other.words.thisSession$ucwords$}: **${stats.messages.session.toLocaleString()}**`,
					"",
					"{lang:other.words.direct$ucwords$} {lang:other.words.messages$ucwords$}",
					`{lang:other.words.total$ucwords$}: **${stats.directMessages.general.toLocaleString()}**`,
					`{lang:other.words.thisSession$ucwords$}: **${stats.directMessages.session.toLocaleString()}**`
				].join("\n"), false)
				.addField("{lang:other.words.redis$ucwords$}", [
					`{lang:${cmd.lang}.connections}: **${r.total_connections_received.toLocaleString()}**`,
					`{lang:${cmd.lang}.cmdsProcessed}: **${r.total_commands_processed.toLocaleString()}**`,
					`{lang:${cmd.lang}.ops}: **${r.instantaneous_ops_per_sec.toLocaleString()}/{lang:other.words.second$ucwords$}**`,
					`{lang:${cmd.lang}.netIn}: **${Strings.formatBytes(r.total_net_input_bytes)}**`,
					`{lang:${cmd.lang}.netOut}: **${Strings.formatBytes(r.total_net_output_bytes)}**`
				].join("\n"), false)
				.addField("{lang:other.words.commands$ucwords$}", [
					`{lang:other.words.total$ucwords$}: **${stats.commands.general.toLocaleString()}**`,
					`{lang:other.words.thisSession$ucwords$}: **${stats.commands.session.toLocaleString()}**`,
					"",
					`{lang:${cmd.lang}.cmdFull|${msg.gConfig.settings.prefix}}`
				].join("\n"));
		} else {
			switch (msg.args[0].toLowerCase()) {
				case "commands": {
					const text = [];
					let i = 0;
					for (const k of Object.keys(stats.commands.specific)) {
						const cmd = stats.commands.specific[k];
						if (!text[i]) text[i] = "";
						const v = [
							/*`**${Strings.ucwords(k)}**:`,
							`\t{lang:other.words.total$ucwords$}: ${cmd.general}`,
							`\t{lang:other.words.thisSession$ucwords$}: ${cmd.session}`,
							"",
							""*/
							`\`${Strings.ucwords(k)}\`: **${cmd.general.toLocaleString()} / ${cmd.session.toLocaleString()}**`,
							""
						].join("\n");
						if (text[i].length + v.length >= 1024) {
							i++;
							text[i] = "";
						}
						text[i] += v;
					}

					e
						.setDescription(`{lang:${cmd.lang}.info}`)
						.addFields(...text.map((t, i) => ({
							name: `{lang:${cmd.lang}.commandsNum|${i + 1}}`,
							value: t,
							inline: true
						})));
					break;
				}

				default: return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidType`));
			}
		}

		return msg.channel.createMessage({
			embed: e.toJSON()
		});
	});
