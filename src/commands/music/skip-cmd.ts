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
		"skip"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Skip the currently playing song",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

	if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

	let vc: Eris.VoiceChannel;
	const t = msg.channel.guild.channels.get(msg.member.voiceState.channelID);
	if (t instanceof Eris.VoiceChannel) vc = t;

	const conn = this.voiceConnections.get(msg.channel.guild.id);

	await conn.stopPlaying();

	const old = msg.gConfig.music.queue.shift();
	const info = await functions.ytinfo(old.link);
	const time = `${Math.floor(parseInt(info.length_seconds, 10) / 60)}m${parseInt(info.length_seconds, 10) - Math.floor(parseInt(info.length_seconds, 10) / 60) * 60}s`;


	if (!old) return msg.reply("either there was an internal error, or I'm not playing anything. You can try manually disconnecting me if this persists.");

	await msg.gConfig.edit({}).then(d => d.reload());

	const embed: Eris.EmbedOptions = {
		title: `Skipped ${old.title} by **${old.channel}**`,
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	};

	return msg.channel.createMessage({ embed });
}));