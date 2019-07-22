import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import ytdl from "ytdl-core";

export default new Command({
	triggers: [
		"queue"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Check your server's music queue.",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	const q = [...msg.gConfig.music.queue];
	q.shift();

	if (q.length === 0) return msg.reply("The queue is empty.");

	const embed: Eris.EmbedOptions = {
		title: `Music Queue for ${msg.channel.guild.name}`,
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		fields: q.map(m => ({
			name: `${m.title} by ${m.channel}`,
			value: `Length: ${Math.floor(m.length / 60)}m${m.length - Math.floor(m.length / 60) * 60}s\nAdded By: <@!${m.blame}>`,
			inline: false
		})),
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};

	return msg.channel.createMessage({ embed });

}));