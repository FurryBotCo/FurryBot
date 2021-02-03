import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import config from "../../config";
import Time from "../../util/Functions/Time";
import * as os from "os";
import * as pkg from "../../../package.json";
import * as pkgLock from "../../../package-lock.json";
import Language from "../../util/Language";
import Internal from "../../util/Functions/Internal";
import phin from "phin";
import Strings from "../../util/Functions/Strings";

export default new Command(["info"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const { drives: diskUsage } = Internal.getDiskUsage();
		const d = [];
		for (const k of Object.keys(diskUsage)) {
			d.push(`${config.emojis.default.dot} {lang:other.words.diskUsage$ucwords$} (${k}): ${Strings.formatBytes(diskUsage[k].total - diskUsage[k].free)} / ${Strings.formatBytes(diskUsage[k].total)}`);
		}
		if (os.hostname().startsWith("boop")) {
			const { body: k } = await phin<{
				drives: {
					[k: string]: {
						free: number;
						total: number;
					};
				};
				unix: boolean;
			}>({
				method: "GET",
				url: "https://10.20.10.129:22222",
				headers: {
					"User-Agent": config.web.userAgent
				},
				parse: "json"
			});
			d.push(`${config.emojis.default.dot} {lang:other.words.diskUsage$ucwords$} (DB): ${Strings.formatBytes(k.drives["/"].total - k.drives["/"].free)} / ${Strings.formatBytes(k.drives["/"].total)}`);
		}
		const st = await this.ipc.getStats();
		if (!st) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.noStats"));
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription([
					"**{lang:other.words.stats$ucwords$}**:",
					`${config.emojis.default.dot} {lang:${cmd.lang}.memoryUsage.process}: ${Strings.formatBytes(process.memoryUsage().heapUsed)} / ${Strings.formatBytes(process.memoryUsage().heapTotal)}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.memoryUsage.total}: ${Strings.formatBytes(st.memory.all.heapUsed)} / ${Strings.formatBytes(st.memory.all.heapTotal)}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.memoryUsage.system}: ${Strings.formatBytes((os.totalmem() - os.freemem()))} / ${Strings.formatBytes(os.totalmem())}`,
					`${config.emojis.default.dot} {lang:other.words.cpuUsage}: ${this.cpuUsage}%`,
					// GB = 1000, GiB = 1024 apparently ??
					// https://en.wikipedia.org/wiki/Gibibyte
					...d,
					`${config.emojis.default.dot} {lang:other.words.uptime$ucwords$}: ${Time.ms(process.uptime() * 1000, true)} (${Time.secondsToHMS(process.uptime())})`,
					`${config.emojis.default.dot} {lang:other.words.shard$ucwords$}: ${msg.channel.guild.shard.id + 1}/${st.shards.size}`,
					`${config.emojis.default.dot} {lang:other.words.cluster$ucwords$}: ${this.cluster.id + 1}/${this.cluster.options.clusterCount}`,
					`${config.emojis.default.dot} {lang:other.words.guilds$ucwords$}: ${st.guilds}`,
					`${config.emojis.default.dot} {lang:other.words.largeGuilds$ucwords$}: ${st.largeGuilds}`,
					`${config.emojis.default.dot} {lang:other.words.users$ucwords$}: ${st.users}`,
					`${config.emojis.default.dot} {lang:other.words.channels$ucwords$}: ${st.channels}`,
					`${config.emojis.default.dot} {lang:other.words.voiceConnections$ucwords$}: ${st.voiceConnections}`,
					`${config.emojis.default.dot} {lang:other.words.commands$ucwords$}: ${this.cmd.commands.length} (${this.cmd.categories.length} {lang:other.words.categories})`,
					"",
					"**{lang:other.words.developers$ucwords$}**:",
					`${config.emojis.default.dot} [{lang:other.words.creator$ucwords$}] [Donovan_DMC](https://furry.cool) <-- **Dumbass ÙwÚ**`,
					`${config.emojis.default.dot} [{lang:other.words.contributor$ucwords$}] [August](https://augu.dev) <-- **Dumbass Cutie**`,
					"",
					"**{lang:other.words.other$ucwords$}**:",
					`${config.emojis.default.dot} {lang:other.words.library$ucwords$}: [Eris Dev](https://github.com/abalabahaha/eris/tree/dev) (**${Eris.VERSION}**, \`${pkgLock.dependencies.eris.version.split("#")[1].slice(0, 7)}\`)`,
					`${config.emojis.default.dot} {lang:other.words.apiVersion$ucwords$}: ${Eris.Constants.REST_VERSION}`,
					`${config.emojis.default.dot} {lang:other.words.gatewayVersion$ucwords$}: ${Eris.Constants.GATEWAY_VERSION}`,
					`${config.emojis.default.dot} {lang:other.words.version$ucwords$}: ${config.version} ({lang:${cmd.lang}.buildDate$ucwords$}: ${config.buildDate.slice(4, 6)}/${config.buildDate.slice(6, 8)}/${config.buildDate.slice(0, 4)})`,
					`${config.emojis.default.dot} {lang:other.words.nodeVersion$ucwords$}: ${process.version}`,
					`${config.emojis.default.dot} {lang:other.words.supportServer$ucwords$}: [${config.client.socials.discord}](${config.client.socials.discord})`,
					`${config.emojis.default.dot} {lang:other.words.donate$ucwords$}: [${config.client.socials.patreon}](${config.client.socials.patreon})`
				].join("\n"))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setThumbnail(this.bot.user.avatarURL)
				.toJSON()
		});
	});
