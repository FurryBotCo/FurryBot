import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import { Internal, Time } from "../../util/Functions";
import * as pkg from "../../../package.json";

export default new Command({
	triggers: [
		"info"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"attachFiles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const st: Stats = await this.getStats();
	if (!st) return msg.reply("{lang:other.errors.noStats}");
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.info.title}")
			.setDescription([
				"**{lang:other.words.stats}**:",
				`\u25FD {lang:other.words.processUsage}: ${Math.round(Internal.memory.process.getUsed() / 1024 / 1024)}MB / ${Math.round(Internal.memory.process.getTotal() / 1024 / 1024)}MB`,
				`\u25FD {lang:other.words.systemUsage}: ${Math.round(Internal.memory.system.getUsed() / 1024 / 1024 / 1024)}GB / ${Math.round(Internal.memory.system.getTotal() / 1024 / 1024 / 1024)}GB`,
				`\u25FD {lang:other.words.uptime}: ${Time.parseTime(process.uptime())} (${Time.secondsToHMS(process.uptime())})`,
				`\u25FD {lang:other.words.shard}: ${msg.channel.guild.shard.id + 1}/${st.shards.length}`,
				`\u25FD {lang:other.words.guilds}: ${st.guilds}`,
				`\u25FD {lang:other.words.largeGuilds}: ${st.largeGuilds}`,
				`\u25FD {lang:other.words.users}: ${st.users}`,
				`\u25FD {lang:other.words.voiceConnections}: ${st.voice}`,
				`\u25FD {lang:other.words.commands}: ${this.cmd.commands.length} (${this.cmd.categories.length} {lang:other.words.categories})`,
				"",
				"**{lang:other.words.creators}**:",
				"\u25FD [Donovan_DMC](https://furry.cool)",
				"",
				"**{lang:other.words.other}**:",
				`\u25FD {lang:other.words.library}: [Eris Dev](https://github.com/abalabahaha/eris/tree/dev) (**${Eris.VERSION}**) | [Eris Fleet](https://npm.im/eris-fleet) (**${pkg.dependencies["eris-fleet"].replace("^", "")}**)`,
				`\u25FD {lang:other.words.apiVersion}: ${Eris.Constants.REST_VERSION}`,
				`\u25FD {lang:other.words.gatewayVersion}: ${Eris.Constants.GATEWAY_VERSION}`,
				`\u25FD {lang:other.words.version}: ${config.version}`,
				`\u25FD {lang:other.words.nodeVersion}: ${process.version}`,
				`\u25FD {lang:other.words.supportServer}: [${config.client.socials.discord}](${config.client.socials.discord})`,
				`\u25FD {lang:other.words.donate}: [${config.client.socials.patreon}](${config.client.socials.patreon})`
			].join("\n"))
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setThumbnail(config.images.botIcon)
			.toJSON()
	});
}));
