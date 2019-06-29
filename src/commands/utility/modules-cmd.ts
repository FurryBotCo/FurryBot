import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"modules"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "List the current statuses of modules in your server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let embed: Eris.EmbedOptions = {
		title: "Module Status",
		description: "The status of some modules on this server.",
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		fields: [
			{
				name: "NSFW",
				value: msg.gConfig.nsfwEnabled ? "Enabled" : "Disabled",
				inline: false
			},
			{
				name: "Delete Command Invocations",
				value: msg.gConfig.deleteCommands ? "Enabled" : "Disabled",
				inline: false
			}
		],
		color: functions.randomColor(),
		timestamp: new Date().toISOString()
	};

	return msg.channel.createMessage({ embed });
}));