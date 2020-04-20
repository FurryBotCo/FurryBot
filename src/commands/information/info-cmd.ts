import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal, Time } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import config from "../../config";
import Eris from "eris";
import pkg from "../../../package.json";

export default new Command({
	triggers: [
		"info",
		"inf",
		"i"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {

	const info = {
		processUsage: `${Math.round(Internal.memory.process.getUsed() / 1024 / 1024)}MB / ${Math.round(Internal.memory.process.getTotal() / 1024 / 1024)}MB`,
		systemUsage: `${Math.round(Internal.memory.system.getUsed() / 1024 / 1024 / 1024)}GB / ${Math.round(Internal.memory.system.getTotal() / 1024 / 1024 / 1024)}GB`,
		uptime: `${Time.parseTime(process.uptime())} (${Time.secondsToHours(process.uptime())})`,
		shard: `${msg.channel.guild.shard.id + 1}/${this.shards.size}`,
		guilds: this.guilds.size,
		largeGuilds: this.guilds.filter(g => g.large).length,
		users: this.users.size,
		channels: Object.keys(this.channelGuildMap).length,
		voiceConnections: this.voiceConnections.size,
		commands: `${this.cmd.commands.length} (${this.cmd.categories.length} categories)`,
		creators: [
			`[Donovan_DMC](https://furry.cool)`
		].join("\n"),
		library: `[Eris Dev](https://github.com/abalabahaha/eris/tree/dev)`,
		libraryVersion: Eris.VERSION,
		apiVersion: Eris.Constants.REST_VERSION,
		gatewayVersion: Eris.Constants.GATEWAY_VERSION,
		version: config.version,
		nodeVersion: process.version,
		supportServer: `[${config.bot.supportURL}](${config.bot.supportURL})`,
		donate: `[${config.bot.patreon}](${config.bot.patreon})`
	};

	if (msg.args.length > 0) {
		if (Object.keys(info).map(k => k.toLowerCase()).includes(msg.args[0].toLowerCase())) {
			const inf = Object.keys(info).find(k => k.toLowerCase() === msg.args[0].toLowerCase());
			return msg.channel.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setTitle("{lang:commands.information.info.title}")
					.setDescription(info[inf])
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.gold)
			});
		}
	}

	msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.info.title}")
			.setDescription([
				"**{lang:commands.information.info.stats}**:",
				`\u25FD {lang:commands.information.info.processUsage}: ${info.processUsage}`,
				`\u25FD {lang:commands.information.info.systemUsage}: ${info.systemUsage}`,
				`\u25FD {lang:commands.information.info.uptime}: ${info.uptime}`,
				`\u25FD {lang:commands.information.info.shard}: ${info.shard}`,
				`\u25FD {lang:commands.information.info.guilds}: ${info.guilds}`,
				`\u25FD {lang:commands.information.info.largeGuilds}: ${info.largeGuilds}`,
				`\u25FD {lang:commands.information.info.users}: ${info.users}`,
				`\u25FD {lang:commands.information.info.channels}: ${info.channels}`,
				`\u25FD {lang:commands.information.info.voiceConnections}: ${info.voiceConnections}`,
				`\u25FD {lang:commands.information.info.commands}: ${info.commands}`,
				"",
				"**{lang:commands.information.info.creators}**:",
				`\u25FD ${info.creators.split("\n").join("\n\u25FD")}`,
				"",
				"**{lang:commands.information.info.other}**:",
				`\u25FD {lang:commands.information.info.library}: ${info.library}`,
				`\u25FD {lang:commands.information.info.libraryVersion}: ${info.libraryVersion} (\`${pkg.dependencies.eris}\`)`,
				`\u25FD {lang:commands.information.info.apiVersion}: ${info.apiVersion}`,
				`\u25FD {lang:commands.information.info.gatewayVersion}: ${info.gatewayVersion}`,
				`\u25FD {lang:commands.information.info.version}: ${info.version}`,
				`\u25FD {lang:commands.information.info.nodeVersion}: ${info.nodeVersion}`,
				`\u25FD {lang:commands.information.info.supportServer}: ${info.supportServer}`,
				`\u25FD {lang:commands.information.info.donate}: ${info.donate}`
			].join("\n"))
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setThumbnail(config.images.botIcon)
	});
}));
