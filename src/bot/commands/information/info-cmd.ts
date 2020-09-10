import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import Eris from "eris";
import config from "../../../config";
import Time from "../../../util/Functions/Time";
import * as os from "os";
import * as pkg from "../../../../package.json";
import * as pkgLock from "../../../../package-lock.json";
import du from "diskusage";
import Language from "../../../util/Language";

export default new Command(["info"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const d = du.checkSync("/");
		const st = await this.ipc.getStats();
		if (!st) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.noStats"));
		const [versionNumber, buildNumber] = pkg.version.split("-");
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription([
					"**{lang:other.words.stats$ucwords$}**:",
					`${config.emojis.default.dot} {lang:${cmd.lang}.memoryUsage.process}: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024).toLocaleString()}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024).toLocaleString()}MB`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.memoryUsage.total}: ${Math.round(st.memory.all.heapUsed / 1024 / 1024).toLocaleString()}MB / ${Math.round(st.memory.all.heapTotal / 1024 / 1024).toLocaleString()}MB`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.memoryUsage.system}: ${Math.round((os.totalmem() - os.freemem()) / 1024 / 1024).toLocaleString()}MB / ${Math.round(os.totalmem() / 1024 / 1024).toLocaleString()}MB`,
					`${config.emojis.default.dot} {lang:other.words.cpuUsage}: ${this.cpuUsage}%`,
					// GB = 1000, GiB = 1024 apparently ??
					// https://en.wikipedia.org/wiki/Gibibyte
					`${config.emojis.default.dot} {lang:other.words.diskUsage$ucwords$}: ${((d.total - d.free) / 1000 / 1000 / 1000).toFixed(2)}GB / ${(d.total / 1000 / 1000 / 1000).toFixed(2)}GB`,
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
					"**{lang:other.words.creators$ucwords$}**:",
					`${config.emojis.default.dot} [Donovan_DMC](https://furry.cool)`,
					"",
					"**{lang:other.words.other$ucwords$}**:",
					`${config.emojis.default.dot} {lang:other.words.library$ucwords$}: [Eris Dev](https://github.com/abalabahaha/eris/tree/dev) (**${Eris.VERSION}**, \`${pkgLock.dependencies.eris.version.split("#")[1].slice(0, 7)}\`)`,
					`${config.emojis.default.dot} {lang:other.words.apiVersion$ucwords$}: ${Eris.Constants.REST_VERSION}`,
					`${config.emojis.default.dot} {lang:other.words.gatewayVersion$ucwords$}: ${Eris.Constants.GATEWAY_VERSION}`,
					`${config.emojis.default.dot} {lang:other.words.version$ucwords$}: ${versionNumber} ({lang:other.words.build$ucwords$}: \`${buildNumber}\`)`,
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
