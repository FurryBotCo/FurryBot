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
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.info.title}")
			.setDescription([
				"**{lang:other.words.stats}**:",
				`\u25FD {lang:commands.information.info.processUsage}: ${Math.round(Internal.memory.process.getUsed() / 1024 / 1024)}MB / ${Math.round(Internal.memory.process.getTotal() / 1024 / 1024)}MB`,
				`\u25FD {lang:commands.information.info.systemUsage}: ${Math.round(Internal.memory.system.getUsed() / 1024 / 1024 / 1024)}GB / ${Math.round(Internal.memory.system.getTotal() / 1024 / 1024 / 1024)}GB`,
				`\u25FD {lang:other.words.uptime}: ${Time.parseTime(process.uptime())} (${Time.secondsToHMS(process.uptime())})`,
				`\u25FD {lang:other.words.shard}: ${msg.channel.guild.shard.id + 1}/${this.bot.shards.size}`,
				`\u25FD {lang:other.words.guilds}: ${this.bot.guilds.size}`,
				`\u25FD {lang:commands.information.info.largeGuilds}: ${this.bot.guilds.filter(g => g.large).length}`,
				`\u25FD {lang:other.words.users}: ${this.bot.users.size}`,
				`\u25FD {lang:other.words.channels}: ${Object.keys(this.bot.channelGuildMap).length}`,
				`\u25FD {lang:commands.information.info.voiceConnections}: ${this.bot.voiceConnections.size}`,
				`\u25FD {lang:other.words.commands}: ${this.cmd.commands.length} (${this.cmd.categories.length} {lang:other.words.categories})`,
				"",
				"**{lang:other.words.creators}**:",
				`\u25FD [Donovan_DMC](https://furry.cool)`,
				"",
				"**{lang:other.words.other}**:",
				`\u25FD {lang:other.words.library}: [Eris Dev](https://github.com/abalabahaha/eris/tree/dev)`,
				`\u25FD {lang:commands.information.info.libraryVersion}: ${Eris.VERSION} (\`${pkg.dependencies.eris}\`)`,
				`\u25FD {lang:commands.information.info.apiVersion}: ${Eris.Constants.REST_VERSION}`,
				`\u25FD {lang:commands.information.info.gatewayVersion}: ${Eris.Constants.GATEWAY_VERSION}`,
				`\u25FD {lang:other.words.version}: ${config.version}`,
				`\u25FD {lang:commands.information.info.nodeVersion}: ${process.version}`,
				`\u25FD {lang:commands.information.info.supportServer}: [${config.client.socials.discord}](${config.client.socials.discord})`,
				`\u25FD {lang:other.words.donate}: [${config.client.socials.patreon}](${config.client.socials.patreon})`
			].join("\n"))
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setThumbnail(config.images.botIcon)
			.toJSON()
	});
}));
