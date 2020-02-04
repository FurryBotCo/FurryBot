import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";
import { Internal, Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"info",
		"inf",
		"i"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get some info about me.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// const st = await this.cluster.getManagerStats();
	// if (st.clusters.length === 0) return msg.reply("hey, I haven't recieved any stats from other clusters yet, please try again later!");

	// \u25FD

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
		supportServer: `[${config.bot.supportInvite}](${config.bot.supportInvite})`,
		donate: `[${config.bot.patreon}](${config.bot.patreon})`
	};

	if (msg.args.length > 0) {
		if (Object.keys(info).map(k => k.toLowerCase()).includes(msg.args[0].toLowerCase())) {
			const inf = Object.keys(info).find(k => k.toLowerCase() === msg.args[0].toLowerCase());
			return msg.channel.createMessage({
				embed: {
					title: "Bot Info!",
					timestamp: new Date().toISOString(),
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					color: Colors.gold,
					description: info[inf]
				}
			});
		}
	}

	const embed: Eris.EmbedOptions = {
		title: "Bot Info!",
		description: [
			"**Stats**:",
			`\u25FD Process Memory Usage: ${info.processUsage}`,
			`\u25FD System Memory Usage: ${info.systemUsage}`,
			`\u25FD Uptime: ${info.uptime}`,
			`\u25FD Shard: ${info.shard}`,
			`\u25FD Server Count: ${info.guilds}`,
			`\u25FD Large Server Count: ${info.largeGuilds}`,
			`\u25FD User Count: ${info.users}`,
			`\u25FD Channel Count: ${info.channels}`,
			`\u25FD Voice Connection Count: ${info.voiceConnections}`,
			`\u25FD Commands: ${info.commands}`,
			"",
			"**Creator(s)**:",
			`\u25FD ${info.creators.split("\n").join("\n\u25FD")}`,
			"",
			"**Other Info**:",
			`\u25FD Library: ${info.library}`,
			`\u25FD Library Version: ${info.libraryVersion}`,
			`\u25FD API Version: ${info.apiVersion}`,
			`\u25FD Gateway Version: ${info.gatewayVersion}`,
			`\u25FD Bot Version: ${info.version}`,
			`\u25FD Node Version: ${info.nodeVersion}`,
			`\u25FD Support Server: ${info.supportServer}`,
			`\u25FD Donate: ${info.donate}`
		].join("\n"),
		timestamp: new Date().toISOString(),
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		color: Colors.gold
	};

	msg.channel.createMessage({ embed });
}));
