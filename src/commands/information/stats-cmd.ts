import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import db from "../../db";
const { mongo, r: Redis } = db;
import config from "../../config";
import { Colors, Command, defaultEmojis, EmbedBuilder } from "core";
import Language from "language";
import { Strings, Utility } from "utilities";
import { performance } from "perf_hooks";

export default new Command<FurryBot, UserConfig, GuildConfig>(["stats"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		const e = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setAuthor(msg.author.tag, msg.author.avatarURL);

		const start = performance.now();
		let end: number;

		if (msg.args.length === 0) {

			const stats = await this.sh.getStats();
			const r = await Redis.info("stats").then(v => v.split(/\n\r?/).slice(1, -1).map(s => ({
				[s.split(":")[0]]: Number(s.split(":")[1])
			})).reduce((a, b) => ({ ...a, ...b }), {})) as Record<
			"total_connections_received" | "total_commands_processed" | "instantaneous_ops_per_sec" |
			"total_net_input_bytes" | "total_net_output_bytes" | "instantaneous_input_kbps" |
			"instantaneous_output_kbps" | "rejected_connections" | "sync_full" |
			"sync_partial_ok" | "sync_partial_err" | "expired_keys" |
			"expired_stale_perc" | "expired_time_cap_reached_count" | "evicted_keys" |
			"keyspace_hits" | "keyspace_misses" | "pubsub_channels" |
			"pubsub_patterns" | "latest_fork_usec" | "migrate_cached_sockets" |
			"slave_expires_tracked_keys" | "active_defrag_hits" | "active_defrag_misses" |
			"active_defrag_key_hits" | "active_defrag_key_misses",
			number>;

			const dbStats: {
				connections: {
					current: number;
					available: number;
					totalCreated: number;
					active: number;
				};
				opcounters: {
					insert: number;
					query: number;
					update: number;
					delete: number;
					getmore: number;
					command: number;
				};
			} = await mongo.db("admin").command({ serverStatus: 1 }).then(v => ({
				// eslint-disable-next-line
				connections: v.connections,
				// eslint-disable-next-line
				opcounters: v.opcounters
			}));


			const dbStart = performance.now();
			await mongo.db("admin").command({
				ping: 1
			});
			const dbEnd = performance.now();

			const redisStart = performance.now();
			await Redis.ping();
			const redisEnd = performance.now();

			if (config.beta) await Redis.select(config.services.redis.db);

			let k: Array<string> = [];
			if (config.beta) k = await Redis.keys("stats:inviteSources:*");
			else k = await Utility.getKeys("stats:inviteSources:*", "0");
			const s = await Promise.all(k.map(async (v) => ({
				[v.split(":").slice(-1)[0]]: await Redis.get(v).then(Number)
			}))).then(v => v.sort((a, b) => Object.values(a)[0] < Object.values(b)[0] ? 1 : -1).reduce((a, b) => ({ ...a, ...b })));
			if (config.beta) await Redis.select(config.services.redis.dbBeta);


			end = performance.now();
			e
				.setTitle(`{lang:${cmd.lang}.titleGeneral}`)
				.addField(
					"{lang:other.words.messages$ucwords$}",
					[
						"**{lang:other.words.server$ucwords$} {lang:other.words.messages$ucwords$}**",
						`{lang:other.words.total$ucwords$}: **${stats.messages.general.toLocaleString()}**`,
						`{lang:other.words.thisSession$ucwords$}: **${stats.messages.session.toLocaleString()}**`,
						"",
						"**{lang:other.words.direct$ucwords$} {lang:other.words.messages$ucwords$}**",
						`{lang:other.words.total$ucwords$}: **${stats.directMessages.general.toLocaleString()}**`,
						`{lang:other.words.thisSession$ucwords$}: **${stats.directMessages.session.toLocaleString()}**`
					].join("\n"),
					true)
				.addField(
					"{lang:other.words.redis$ucwords$}",
					[
						`{lang:other.words.ping$ucwords$}: **${(redisEnd - redisStart).toFixed(3)}ms**`,
						`{lang:${cmd.lang}.connections}: **${r.total_connections_received.toLocaleString()}**`,
						`{lang:${cmd.lang}.cmdsProcessed}: **${r.total_commands_processed.toLocaleString()}**`,
						`{lang:${cmd.lang}.ops}: **${r.instantaneous_ops_per_sec.toLocaleString()}/{lang:other.words.second}**`,
						`{lang:${cmd.lang}.netIn}: **${Strings.formatBytes(r.total_net_input_bytes)}**`,
						`{lang:${cmd.lang}.netOut}: **${Strings.formatBytes(r.total_net_output_bytes)}**`
					].join("\n"),
					true)
				.addEmptyField(true)
				.addField(
					"{lang:other.words.mongodb}",
					[
						`{lang:other.words.ping$ucwords$}: **${(dbEnd - dbStart).toFixed(3)}ms**`,
						`{lang:${cmd.lang}.dbCurrent}: **${dbStats.connections.current.toLocaleString()}**`,
						`{lang:${cmd.lang}.dbTotal}: **${dbStats.connections.totalCreated.toLocaleString()}**`,
						`{lang:${cmd.lang}.dbActive}: **${dbStats.connections.active.toLocaleString()}**`,
						"",
						"**{lang:other.words.mongodb} {lang:other.words.commands$ucwords$}**",
						...Object.keys(dbStats.opcounters).map(v => `${defaultEmojis.dot} {lang:other.words.${v}$upper$}: **${(dbStats.opcounters[v as keyof (typeof dbStats)["opcounters"]]).toLocaleString()}**`)
					].join("\n"),
					true
				)
				.addField(
					`{lang:${cmd.lang}.botInvites}`,
					[
						...Object.keys(s).map(v => `${v}: **${s[v]}**`)
					].join("\n"),
					true
				)
				.addEmptyField(true)
				.addField(
					"{lang:other.words.other$ucwords$}",
					[
						"**{lang:other.words.commands$ucwords$}**:",
						`${defaultEmojis.dot} {lang:other.words.total$ucwords$}: **${stats.commands.general.toLocaleString()}**`,
						`${defaultEmojis.dot} {lang:other.words.thisSession$ucwords$}: **${stats.commands.session.toLocaleString()}**`,
						"",
						`{lang:${cmd.lang}.cmdFull|${msg.prefix}}`,
						"",
						"**{lang:other.words.events$ucwords$}**:"
					].join("\n"),
					false
				);

		} else {
			const per = msg.dashedArgs.value.includes("percent");
			switch (msg.args[0].toLowerCase()) {
				case "commands": {
					const stats = await this.sh.getStats();
					const text = [];
					let i = 0;
					for (const k of Object.keys(stats.commands.specific)) {
						const c = stats.commands.specific[k];
						if (per && c.general < 1000) continue;
						if (!text[i]) text[i] = "";
						const v = [
							/* `**${Strings.ucwords(k)}**:`,
							`\t{lang:other.words.total$ucwords$}: ${cmd.general}`,
							`\t{lang:other.words.thisSession$ucwords$}: ${cmd.session}`,
							"",
							""*/
							per ?
								`\`${k}\`: **${c.general.toLocaleString()}** (${(Math.round(((c.general / stats.commands.general) + Number.EPSILON) * 100) / 100) * 100}%) / **${c.session.toLocaleString()}** (${(Math.round(((c.session / stats.commands.session) + Number.EPSILON) * 100) / 100) * 100})` :
								`\`${k}\`: **${c.general.toLocaleString()}** / **${c.session.toLocaleString()}**`,
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
						.addFields(...text.map((t, v) => ({
							name: `{lang:${cmd.lang}.commandsNum|${v + 1}}`,
							value: t,
							inline: true
						})));
					break;
				}

				default: return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidType`));
			}
		}

		return msg.channel.createMessage({
			embed: e
				.setFooter(`{lang:${cmd.lang}.footer|${(end! - start).toFixed(3)}}`, this.client.user.avatarURL)
				.toJSON()
		});
	});
