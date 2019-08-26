import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import { mdb } from "../../modules/Database";
import ytdl from "ytdl-core";

export default new Command({
	triggers: [
		"pause"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e4,
	donatorCooldown: 1.5e4,
	description: "Pause the music that is currently playing.",
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
	const t = msg.channel.guild.channels.get(msg.channel.guild.members.get(this.user.id).voiceState.channelID);
	if (t instanceof Eris.VoiceChannel) vc = t;
	else return msg.reply(`I don't seem to be in a voice channel..`);

	const conn = this.voiceConnections.get(msg.channel.guild.id);

	if (conn.paused) return msg.reply("playback is already paused..");

	await conn.pause();

	return msg.reply(`paused playback in **${vc.name}**. You can use \`${msg.gConfig.prefix}resume\` to resume playback!`);
}));