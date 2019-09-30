import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import { Command, CommandError } from "../util/CommandHandler";
import * as Eris from "eris";
import ytdl from "ytdl-core";
import { YouTubeSearchResults } from "youtube-search";
import CmdHandler from "../util/cmd";

type CommandContext = FurryBot & { _cmd: Command };

CmdHandler
	.addCategory({
		name: "music",
		displayName: ":musical_note: Music",
		devOnly: false,
		description: "Free music right inside your Discord!"
	})
	.addCommand({
		triggers: [
			"join"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Make me join a voice channel with you!",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

			let vc: Eris.VoiceChannel;
			const t = msg.channel.guild.channels.get(msg.member.voiceState.channelID);
			if (t instanceof Eris.VoiceChannel) vc = t;

			if (!vc.permissionsOf(this.bot.user.id).has("voiceConnect")) return msg.reply("I cannot join the voice channel you are currently in.");

			if (!vc.permissionsOf(this.bot.user.id).has("voiceSpeak")) return msg.reply("I cannot speak in the voice channel you are currently in.");

			vc.join({}).then(() => msg.reply(`joined ${vc.name}`));
		})
	})
	.addCommand({
		triggers: [
			"leave"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Make me leave a voice channel!",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			// if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

			let vc: Eris.VoiceChannel;
			const t = msg.channel.guild.channels.get(msg.channel.guild.members.get(this.bot.user.id).voiceState.channelID);
			if (t instanceof Eris.VoiceChannel) vc = t;
			else return msg.reply(`I don't seem to be in a voice channel..`);

			await vc.leave();

			return msg.reply(`left ${vc.name}.`);
		})
	})
	.addCommand({
		triggers: [
			"nowplaying",
			"np"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Check what song is currently playing.",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
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
				color: this.f.randomColor()
			};

			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"pause"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Pause the music that is currently playing.",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

			let vc: Eris.VoiceChannel;
			const t = msg.channel.guild.channels.get(msg.channel.guild.members.get(this.bot.user.id).voiceState.channelID);
			if (t instanceof Eris.VoiceChannel) vc = t;
			else return msg.reply(`I don't seem to be in a voice channel..`);

			const conn = this.bot.voiceConnections.get(msg.channel.guild.id);

			if (conn.paused) return msg.reply("playback is already paused..");

			await conn.pause();

			return msg.reply(`paused playback in **${vc.name}**. You can use \`${msg.gConfig.prefix}resume\` to resume playback!`);
		})
	})
	.addCommand({
		triggers: [
			"play"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Play some music inside your Discord server.",
		usage: "<search/yt link>",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 1) throw new CommandError(null, "ERR_INVALID_USAGE");

			if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (msg.gConfig.music.queue.length >= 6 && !(msg.uConfig.patreon.amount >= 3)) return msg.reply("Hey, you can only have **5** songs in your queue right now, we may have a premium option to allow for more soon.");
			const vc = msg.channel.guild.channels.get(msg.member.voiceState.channelID) as Eris.VoiceChannel;

			if (!vc.permissionsOf(this.bot.user.id).has("voiceConnect")) return msg.reply("I cannot connect to the voice channel you are in.");
			if (!vc.permissionsOf(this.bot.user.id).has("voiceSpeak")) return msg.reply("I cannot speak in the voice channel you are in.");

			const q = msg.args.join(" ");
			const search: YouTubeSearchResults[] = await this.f.ytsearch(q).catch(err => null);
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
			const info = await this.f.ytinfo(song.link).catch(err => null);

			if (!v) return msg.reply("failed to fetch that video.");
			if (!info) return msg.reply("failed to fetch info for that video.");

			const me = msg.channel.guild.members.get(this.bot.user.id);

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
					color: this.f.randomColor()
				};

				await m.edit({ content: "", embed });
			} else {
				conn = this.bot.voiceConnections.get(msg.channel.guild.id);
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
						color: this.f.randomColor()
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
						color: this.f.randomColor()
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
							color: this.f.randomColor()
						};

						const k: any = msg.guild.channels.get(msg.channel.guild.members.get(me.user.id).voiceState.channelID);
						const c: Eris.VoiceChannel = k;

						await c.leave();
						return msg.channel.createMessage({ embed });
					} else {
						const song = msg.gConfig.music.queue[0];
						const v = await ytdl(song.link);
						const info = await this.f.ytinfo(song.link);

						const time = `${Math.floor(parseInt(info.length_seconds, 10) / 60)}m${parseInt(info.length_seconds, 10) - Math.floor(parseInt(info.length_seconds, 10) / 60) * 60}s`;

						const embed: Eris.EmbedOptions = {
							title: `Now Playing ${song.title} by **${song.channel}**`,
							description: `Song Length: ${time}`,
							timestamp: new Date().toISOString(),
							color: this.f.randomColor()
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

		})
	})
	.addCommand({
		triggers: [
			"queue"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Check your servers music queue.",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
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
				color: this.f.randomColor()
			};

			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"resume"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Resume paused playback.",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

			let vc: Eris.VoiceChannel;
			const t = msg.channel.guild.channels.get(msg.channel.guild.members.get(this.bot.user.id).voiceState.channelID);
			if (t instanceof Eris.VoiceChannel) vc = t;
			else return msg.reply(`I don't seem to be in a voice channel..`);

			const conn = this.bot.voiceConnections.get(msg.channel.guild.id);

			if (!conn.paused) return msg.reply("I don't seem to be paused..?");

			await conn.resume();

			return msg.reply(`resumed playback in **${vc.name}**. You can use \`${msg.gConfig.prefix}pause\` to pause playback!`);
		})
	})
	.addCommand({
		triggers: [
			"skip"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Skip the currently playing song.",
		usage: "",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

			let vc: Eris.VoiceChannel;
			const t = msg.channel.guild.channels.get(msg.member.voiceState.channelID);
			if (t instanceof Eris.VoiceChannel) vc = t;

			const conn = this.bot.voiceConnections.get(msg.channel.guild.id);

			await conn.stopPlaying();

			const old = msg.gConfig.music.queue.shift();
			const info = await this.f.ytinfo(old.link);
			const time = `${Math.floor(parseInt(info.length_seconds, 10) / 60)}m${parseInt(info.length_seconds, 10) - Math.floor(parseInt(info.length_seconds, 10) / 60) * 60}s`;


			if (!old) return msg.reply("either there was an internal error, or I'm not playing anything. You can try manually disconnecting me if this persists.");

			await msg.gConfig.edit({}).then(d => d.reload());

			const embed: Eris.EmbedOptions = {
				title: `Skipped ${old.title} by **${old.channel}**`,
				timestamp: new Date().toISOString(),
				color: this.f.randomColor()
			};

			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"volume"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Set the volume for the music that is currently playing.",
		usage: "<1-100>",
		features: [],
		category: "music",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 1) throw new CommandError(null, "ERR_INVALID_USAGE");

			if (!msg.member.voiceState.channelID) return msg.reply("you must be in a voice channel to use this.");

			if (!msg.member.permission.has("manageGuild") && !msg.member.roles.map(r => msg.guild.roles.get(r)).map(r => r.name.toLowerCase()).includes("dj")) return msg.reply(`You must have either the **manageGuild** permission, or a role called **dj** to use this.`);

			let vc: Eris.VoiceChannel;
			const t = msg.channel.guild.channels.get(msg.channel.guild.members.get(this.bot.user.id).voiceState.channelID);
			if (t instanceof Eris.VoiceChannel) vc = t;
			else return msg.reply(`I don't seem to be in a voice channel..`);

			const conn = this.bot.voiceConnections.get(msg.channel.guild.id);

			const v = parseInt(msg.args[0], 10);

			if (isNaN(v) || v < 1 || v > 100) return msg.reply("you must suply a valid number between one (1) and 100.");

			conn.setVolume(v);
			return msg.reply(`set the playback volume in **${vc.name}** to **${v}**.`);
		})
	});

export default null;
