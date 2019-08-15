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
import { YouTubeSearchResults } from "youtube-search";

export default new Command({
	triggers: [
		"play"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Play some music in your Discord",
	usage: "<song search/yt link>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

	if (msg.gConfig.music.queue.length >= 6 && !msg.gConfig.premium) return msg.reply("Hey, you can only have **5** songs in your queue right now, we may have a premium option to allow for more soon.");
	let vc: Eris.VoiceChannel;
	const t = msg.channel.guild.channels.get(msg.member.voiceState.channelID);
	if (t instanceof Eris.VoiceChannel) vc = t;

	if (!vc.permissionsOf(this.user.id).has("voiceConnect")) return msg.reply("I cannot connect to the voice channel you are in.");
	if (!vc.permissionsOf(this.user.id).has("voiceSpeak")) return msg.reply("I cannot speak in the voice channel you are in.");

	const q = msg.args.join(" ");
	const search: YouTubeSearchResults[] = await functions.ytsearch(q).catch(err => null);
	if (!search) return msg.reply("there was an internal error while fetching search results.");

	if (search.length < 1) return msg.reply("No results were found");

	let song: YouTubeSearchResults;


	let m: Eris.Message;

	if (/https?:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)[A-Z\d_-]{9,13}/gi.test(q)) {
		song = search[0];
		m = await msg.channel.createMessage(`Loading **${q}**.`);
	} else {
		m = await msg.channel.createMessage(`Showing results for **${q}**\n${search.map((s, i) => `\`${i + 1}\` - ${s.title} by **${s.channelTitle}**`).join("\n")}\n\nPlease reply with a number.\nYou can also say **cancel** to cancel.`);

		const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 3e4);

		if (!d) return msg.reply("command timed out!");

		if (d.content.toLowerCase() === "cancel") return msg.reply("canceled.");

		const j = parseInt(d.content, 10);

		if (isNaN(j)) return msg.reply("that choice was not valid!");

		song = search[j - 1];

		if (!song) return msg.reply("that choice was not found!");
	}

	let v;
	try {
		v = ytdl(song.link);
	} catch (e) {
		v = null;
	}
	const info = await functions.ytinfo(song.link).catch(err => null);

	if (!v) return msg.reply("failed to fetch that video.");
	if (!info) return msg.reply("failed to fetch info for that video.");

	const me = msg.channel.guild.members.get(this.user.id);

	let conn: Eris.VoiceConnection;

	const time = `${Math.floor(parseInt(info.length_seconds, 10) / 60)}m${parseInt(info.length_seconds, 10) - Math.floor(parseInt(info.length_seconds, 10) / 60) * 60}s`;

	let newplay = false;

	if (!me.voiceState.channelID) {

		msg.gConfig.music.queue = [];
		await msg.gConfig.edit({ music: { textChannel: msg.channel.id } }).then(d => d.reload());

		conn = await vc.join({});
		await conn.updateVoiceState(false, true);
		msg.gConfig.music.queue.push({ link: song.link, channel: info.author.name, length: parseInt(info.length_seconds, 10), title: song.title, blame: msg.author.id });
		await msg.gConfig.edit({}).then(d => d.reload());

		conn.play(v);

		newplay = true;

		const embed: Eris.EmbedOptions = {
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			title: `Now Playing ${song.title} by **${song.channelTitle}**`,
			description: `Song Length: ${time}`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};

		await m.edit({ content: "", embed });
	} else {
		conn = this.voiceConnections.get(msg.channel.guild.id);
		msg.gConfig.music.queue.push({ link: song.link, channel: info.author.name, length: parseInt(info.length_seconds, 10), title: song.title, blame: msg.author.id });
		await msg.gConfig.edit({}).then(d => d.reload());


		if (msg.gConfig.music.queue.length === 1) {
			conn.play(v);

			newplay = true;

			const embed: Eris.EmbedOptions = {
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				url: song.link,
				title: `Now Playing [${song.title}](${song.link}) by **${song.channelTitle}**`,
				description: `Song Length: ${time}`,
				timestamp: new Date().toISOString(),
				color: functions.randomColor()
			};

			await m.edit({ content: "", embed });
		} else {
			const tuntil = msg.gConfig.music.queue.map(q => q.length).reduce((a, b) => a + b);
			const tUntil = `${Math.floor(tuntil / 60)}m${tuntil - Math.floor(tuntil / 60) * 60}s`;

			const embed: Eris.EmbedOptions = {
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				title: `Added ${song.title} by **${song.channelTitle}**`,
				description: `Estimated time until playing: \`${tUntil}\`\nSong Length: ${time}`,
				timestamp: new Date().toISOString(),
				color: functions.randomColor()
			};

			await m.edit({ content: "", embed });
		}
	}

	if (newplay) {
		async function handleQueue() {
			await msg.gConfig.reload();
			msg.gConfig.music.queue.shift();
			await msg.gConfig.edit({}).then(d => d.reload());

			if (msg.gConfig.music.queue.length === 0) {
				const embed: Eris.EmbedOptions = {
					title: "Queue Concluded",
					timestamp: new Date().toISOString(),
					color: functions.randomColor()
				};

				const k: any = msg.guild.channels.get(msg.channel.guild.members.get(me.user.id).voiceState.channelID);
				const c: Eris.VoiceChannel = k;

				await c.leave();
				return msg.channel.createMessage({ embed });
			} else {
				const song = msg.gConfig.music.queue[0];
				const v = await ytdl(song.link);
				const info = await functions.ytinfo(song.link);

				const time = `${Math.floor(parseInt(info.length_seconds, 10) / 60)}m${parseInt(info.length_seconds, 10) - Math.floor(parseInt(info.length_seconds, 10) / 60) * 60}s`;

				const embed: Eris.EmbedOptions = {
					title: `Now Playing ${song.title} by **${song.channel}**`,
					description: `Song Length: ${time}`,
					timestamp: new Date().toISOString(),
					color: functions.randomColor()
				};

				const k: any = msg.guild.channels.get(msg.channel.guild.members.get(me.user.id).voiceState.channelID);
				const c: Eris.VoiceChannel = k;

				conn.play(v);

				conn.once("end", handleQueue);
				return msg.channel.createMessage({ embed });
			}
		}

		conn.once("end", handleQueue);
		conn.once("disconnect", async (err) => {
			await msg.gConfig.reload();
			msg.gConfig.music.queue = [];
			await msg.gConfig.edit({ music: { volume: 100, textChannel: null } });
		});
	}

}));

/*

if (msg.gConfig.music.queue.length !== 0) {
			await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, {
				$push: {
					music: {
						queue: { link: song.link, channel: info.author.name, length: parseInt(info.length_seconds, 10), title: song.title }
					}
				}
			});
		}

		*/