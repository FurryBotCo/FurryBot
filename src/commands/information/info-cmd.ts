import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import pkg from "../../../package.json";
import lock from "../../../package-lock.json";
import { Colors, Command, defaultEmojis, EmbedBuilder } from "core";
import { Internal, Strings, Time } from "utilities";
import { VERSION as ClusteringVersion } from "clustering";
import Language from "language";
import Eris from "eris";
import * as os from "os";

export default new Command<FurryBot, UserConfig, GuildConfig>(["info"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const st = await this.ipc.getStats(false);
		if (st === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.noStats"));
		const { drives: diskUsage } = Internal.getDiskUsage();
		const d = [];
		for (const k of Object.keys(diskUsage)) {
			d.push(`${defaultEmojis.dot} {lang:other.words.diskUsage$ucwords$} (${k}): ${Strings.formatBytes(diskUsage[k].total - diskUsage[k].free)} / ${Strings.formatBytes(diskUsage[k].total)}`);
		}
		const e = lock.dependencies.eris.version.indexOf("#") === -1 ? `[Eris](https://npm.im/eris) (**${Eris.VERSION}**)` : `[Eris Dev](https://github.com/abalabahaha/eris/commit/${lock.dependencies.eris.version.split("#")[1]}) (**${Eris.VERSION}**, \`${lock.dependencies.eris.version.split("#")[1].slice(0, 7)}\`)`;

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription([
					"**{lang:other.words.stats$ucwords$}**:",
					...st.clusters.map(v => `${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.cluster${v.id === this.clusterId ? "Current" : ""}|${v.id}}: ${Strings.formatBytes(v.memory.heapUsed)} / ${Strings.formatBytes(v.memory.heapTotal)}`),
					...st.services.map(v => `${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.service|${v.name}}: ${Strings.formatBytes(v.memory.heapUsed)} / ${Strings.formatBytes(v.memory.heapTotal)}`),
					`${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.master}: ${Strings.formatBytes(st.memory.heapUsed)} / ${Strings.formatBytes(st.memory.heapTotal)}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.total}: ${Strings.formatBytes(st.combinedMemory.heapUsed)} / ${Strings.formatBytes(st.combinedMemory.heapTotal)}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.system}: ${Strings.formatBytes((os.totalmem() - os.freemem()))} / ${Strings.formatBytes(os.totalmem())}`,
					`${defaultEmojis.dot} {lang:other.words.cpuUsage}: ${this.cpuUsage}%`,
					...d,
					`${defaultEmojis.dot} {lang:other.words.uptime$ucwords$}: ${Time.ms(process.uptime() * 1000, true)} (${Time.secondsToHMS(process.uptime())})`,
					`${defaultEmojis.dot} {lang:other.words.shard$ucwords$}: ${msg.channel.guild.shard.id + 1}/${st.shards.length}`,
					`${defaultEmojis.dot} {lang:other.words.cluster$ucwords$}: ${this.clusterId + 1}/${st.clusters.length}`,
					`${defaultEmojis.dot} {lang:other.words.guilds$ucwords$}: ${st.guilds}`,
					`${defaultEmojis.dot} {lang:other.words.largeGuilds$ucwords$}: ${st.largeGuilds}`,
					`${defaultEmojis.dot} {lang:other.words.users$ucwords$}: ${st.users}`,
					`${defaultEmojis.dot} {lang:other.words.channels$ucwords$}: ${st.guildChannels}`,
					`${defaultEmojis.dot} {lang:other.words.voiceConnections$ucwords$}: ${st.voiceConnections}`,
					`${defaultEmojis.dot} {lang:other.words.commands$ucwords$}: ${this.cmd.commands.length} (${this.cmd.categories.length} {lang:other.words.categories})`,
					"",
					"**{lang:other.words.developers$ucwords$}**:",
					`${defaultEmojis.dot} [{lang:other.words.creator$ucwords$}] [Donovan_DMC](https://donovan.is.gay) <-- **Dumbass ÙwÚ**`,
					"",
					"**{lang:other.words.other$ucwords$}**:",
					`${defaultEmojis.dot} {lang:other.words.discordLib$ucwords$}: ${e}`,
					`${defaultEmojis.dot} {lang:other.words.clusteringLib$ucwords$}: [Custom](https://github.com/UwUCodes/Clustering) (**${ClusteringVersion}**)`,
					`${defaultEmojis.dot} {lang:other.words.apiVersion$ucwords$}: ${Eris.Constants.REST_VERSION}`,
					`${defaultEmojis.dot} {lang:other.words.gatewayVersion$ucwords$}: ${Eris.Constants.GATEWAY_VERSION}`,
					`${defaultEmojis.dot} {lang:other.words.version$ucwords$}: ${pkg.version} ({lang:${cmd.lang}.buildDate$ucwords$}: ${pkg.buildDate === null ? "Unknown" : `${String(pkg.buildDate).slice(4, 6)}/${String(pkg.buildDate).slice(6, 8)}/${String(pkg.buildDate).slice(0, 4)}`})`,
					`${defaultEmojis.dot} {lang:other.words.nodeVersion$ucwords$}: ${process.version}`,
					`${defaultEmojis.dot} {lang:other.words.supportServer$ucwords$}: [${config.client.socials.discord}](${config.client.socials.discord})`,
					`${defaultEmojis.dot} {lang:other.words.donate$ucwords$}: [${config.client.socials.patreon}](${config.client.socials.patreon})`
				].join("\n"))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setThumbnail(this.client.user.avatarURL)
				.toJSON()
		});
	});
