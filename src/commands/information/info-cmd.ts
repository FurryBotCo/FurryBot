import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"info",
		"inf"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get some info about the bot",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	const embed: Eris.EmbedOptions = {
		title: "Bot Info!",
		fields: [
			{
				name: "Process Memory Usage",
				value: `${Math.round(functions.memory.process.getUsed() / 1024 / 1024)}MB/${Math.round(functions.memory.process.getTotal() / 1024 / 1024)}MB`,
				inline: false
			}, {
				name: "System Memory Usage",
				value: `${Math.round(functions.memory.system.getUsed() / 1024 / 1024 / 1024)}GB/${Math.round(functions.memory.system.getTotal() / 1024 / 1024 / 1024)}GB`,
				inline: false
			}, {
				name: "Library",
				value: "Eris",
				inline: false
			}, {
				name: "Uptime",
				value: `${functions.parseTime(process.uptime())} (${functions.secondsToHours(process.uptime())})`,
				inline: false
			}, {
				name: "Total Guilds",
				value: this.guilds.size.toString(),
				inline: false
			}, {
				name: `Large Guilds (${this.options.largeThreshold}+ Members)`,
				value: this.guilds.filter(g => g.large).length.toString(),
				inline: false
			}, {
				name: "Total Users",
				value: this.guilds.map(g => g.memberCount).reduce((a, b) => a + b).toString(),
				inline: false
			}, {
				name: "Commands",
				value: this.commandTriggers.length.toString(),
				inline: false
			}, {
				name: "API Version",
				value: "7",
				inline: false
			}, {
				name: "Bot Version",
				value: config.version,
				inline: false
			}, {
				name: `Eris Version`,
				value: Eris.VERSION,
				inline: false
			}, {
				name: "Node.JS Version",
				value: process.version,
				inline: false
			}, {
				name: "Support Server",
				value: "[https://furry.bot/inv](https://furry.bot/inv)",
				inline: false
			}, {
				name: "Bot Creator",
				value: "Donovan_DMC#3621, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
				inline: false
			}
		]
	};
	Object.assign(embed, msg.embed_defaults());
	msg.channel.createMessage({ embed });
}));