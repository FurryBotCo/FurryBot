import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";
import { mdb } from "../../modules/Database";
import ytdl from "ytdl-core";

export default new Command({
	triggers: [
		"nowplaying",
		"np"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Check what song is currently playing.",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	const [q] = [...msg.gConfig.music.queue];

	if (!q) return msg.reply("Nothing is playing right now.");

	const embed: Eris.EmbedOptions = {
		title: `Now Playing in ${msg.channel.guild.name}`,
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		fields: [
			{
				name: `${q.title} by ${q.channel}`,
				value: `Length: ${Math.floor(q.length / 60)}m${q.length - Math.floor(q.length / 60) * 60}s\nAdded By: <@!${q.blame}>`,
				inline: false
			}
		],
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};

	return msg.channel.createMessage({ embed });

}));