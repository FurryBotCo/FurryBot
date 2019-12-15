import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger, VERSION as CLVersion } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

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
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// const st = await this.cluster.getManagerStats();
	// if (st.clusters.length === 0) return msg.reply("hey, I haven't recieved any stats from other clusters yet, please try again later!");

	// ${"\u25FD"}

	const embed: Eris.EmbedOptions = {
		title: "Bot Info!",
		description: [
			"**Stats**:",
			`${"\u25FD"} Process Memory Usage: ${Math.round(this.f.memory.process.getUsed() / 1024 / 1024)}MB / ${Math.round(this.f.memory.process.getTotal() / 1024 / 1024)}MB`,
			`${"\u25FD"} System Memory Usage: ${Math.round(this.f.memory.system.getUsed() / 1024 / 1024 / 1024)}GB / ${Math.round(this.f.memory.system.getTotal() / 1024 / 1024 / 1024)}GB`,
			`${"\u25FD"} Uptime: ${this.f.parseTime(process.uptime())} (${this.f.secondsToHours(process.uptime())})`,
			`${"\u25FD"} Shard: ${msg.channel.guild.shard.id + 1}/${this.shards.size}`,
			`${"\u25FD"} Server Count: ${this.guilds.size}`,
			`${"\u25FD"} Large Server Count: ${this.guilds.filter(g => g.large).length}`,
			`${"\u25FD"} User Count: ${this.users.size}`,
			`${"\u25FD"} Channel Count: ${Object.keys(this.channelGuildMap).length}`,
			`${"\u25FD"} Voice Connection Count: ${this.voiceConnections.size}`,
			`${"\u25FD"} Commands: ${this.cmd.commands.length}`,
			"",
			"**Creator(s)**:",
			`${"\u25FD"} [Donovan_DMC](https://furry.cool)`,
			"",
			"**Other Info**:",
			`${"\u25FD"} Library: [Eris Dev](https://github.com/abalabahaha/eris/tree/dev)`,
			`${"\u25FD"} Library Version: ${Eris.VERSION}`,
			`${"\u25FD"} API Version: 7`,
			`${"\u25FD"} Bot Version: ${config.version}`,
			`${"\u25FD"} Node Version: ${process.version}`,
			`${"\u25FD"} Support Server: [${config.bot.supportInvite}](${config.bot.supportInvite})`
		].join("\n"),
		timestamp: new Date().toISOString(),
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		color: Math.floor(Math.random() * 0xFFFFFF)
	};

	msg.channel.createMessage({ embed });
}));
