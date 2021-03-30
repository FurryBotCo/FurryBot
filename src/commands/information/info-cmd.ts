import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import pkg from "../../../package.json";
import lock from "../../../package-lock.json";
import { Colors, Command, defaultEmojis, EmbedBuilder } from "core";
import { Internal, Strings, Time } from "utilities";
import { VERSION as FleetVersion } from "eris-fleet";
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
		const st = await this.ipc.getStats();
		if (st === undefined) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.noStats"));
		const { drives: diskUsage } = Internal.getDiskUsage();
		const d = [];
		for (const k of Object.keys(diskUsage)) {
			d.push(`${defaultEmojis.dot} {lang:other.words.diskUsage$ucwords$} (${k}): ${Strings.formatBytes(diskUsage[k].total - diskUsage[k].free)} / ${Strings.formatBytes(diskUsage[k].total)}`);
		}
		// because for some reason, clusters can be present twice
		const j: Array<number> = [];
		for (const c of st.clusters) {
			if (j.includes(c.id)) st.clusters.splice(st.clusters.indexOf(c), 1);
			else j.push(c.id);
		}

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription([
					"**{lang:other.words.stats$ucwords$}**:",
					...st.clusters.map(v => `${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.cluster${v.id === this.clusterId ? "Current" : ""}|${v.id}}: ${Strings.formatBytes(v.memory.heapUsed)} / ${Strings.formatBytes(v.memory.heapTotal)}`),
					...st.services.map(v => `${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.service|${v.name}}: ${Strings.formatBytes(v.memory.heapUsed)} / ${Strings.formatBytes(v.memory.heapTotal)}`),
					`${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.master}: ${Strings.formatBytes(st.memory.master.heapUsed)} / ${Strings.formatBytes(st.memory.master.heapTotal)}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.total}: ${Strings.formatBytes(st.memory.total.heapUsed)} / ${Strings.formatBytes(st.memory.total.heapTotal)}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.memoryUsage.system}: ${Strings.formatBytes((os.totalmem() - os.freemem()))} / ${Strings.formatBytes(os.totalmem())}`,
					`${defaultEmojis.dot} {lang:other.words.cpuUsage}: ${this.cpuUsage}%`,
					...d,
					`${defaultEmojis.dot} {lang:other.words.uptime$ucwords$}: ${Time.ms(process.uptime() * 1000, true)} (${Time.secondsToHMS(process.uptime())})`,
					`${defaultEmojis.dot} {lang:other.words.shard$ucwords$}: ${msg.channel.guild.shard.id + 1}/${st.shardCount}`,
					`${defaultEmojis.dot} {lang:other.words.cluster$ucwords$}: ${this.clusterId + 1}/${this.cluster.clusterCount}`,
					`${defaultEmojis.dot} {lang:other.words.guilds$ucwords$}: ${st.guilds}`,
					`${defaultEmojis.dot} {lang:other.words.largeGuilds$ucwords$}: ${st.largeGuilds}`,
					`${defaultEmojis.dot} {lang:other.words.users$ucwords$}: ${st.users}`,
					`${defaultEmojis.dot} {lang:other.words.channels$ucwords$}: ${st.channels}`,
					`${defaultEmojis.dot} {lang:other.words.voiceConnections$ucwords$}: ${st.voice}`,
					`${defaultEmojis.dot} {lang:other.words.commands$ucwords$}: ${this.cmd.commands.length} (${this.cmd.categories.length} {lang:other.words.categories})`,
					"",
					"**{lang:other.words.developers$ucwords$}**:",
					`${defaultEmojis.dot} [{lang:other.words.creator$ucwords$}] [Donovan_DMC](https://donovan.is.gay) <-- **Dumbass ÙwÚ**`,
					`${defaultEmojis.dot} [{lang:other.words.contributor$ucwords$}] [August](https://augu.dev) <-- **Dumbass Cutie**`,
					"",
					"**{lang:other.words.other$ucwords$}**:",
					`${defaultEmojis.dot} {lang:other.words.discordLib$ucwords$}: [Eris Dev](https://github.com/abalabahaha/eris/commit/${lock.dependencies.eris.version.split("#")[1]}) (**${Eris.VERSION}**, \`${lock.dependencies.eris.version.split("#")[1].slice(0, 7)}\`)`,
					`${defaultEmojis.dot} {lang:other.words.clusteringLib$ucwords$}: [Eris-Fleet (custom)](https://github.com/FurryBotCo/eris-fleet) (**${FleetVersion}**)`,
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
				.setThumbnail(this.bot.user.avatarURL)
				.toJSON()
		});
	});
