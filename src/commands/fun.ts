import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import config from "../config";
import { Command, CommandError } from "../util/CommandHandler";
import phin from "phin";
import * as Eris from "eris";
import UserConfig from "../modules/config/UserConfig";
import { mdb } from "../modules/Database";
import ReactionQueue from "../util/queue/ReactionQeueue";
import _ from "lodash";
import util from "util";
import CmdHandler from "../util/cmd";
import { Logger } from "@donovan_dmc/ws-clusters";

type CommandContext = FurryBot & { _cmd: Command };

CmdHandler
	.addCategory({
		name: "fun",
		displayName: ":smile: Fun",
		devOnly: false,
		description: "Some commands to spice up your chat"
	})
	.addCommand({
		triggers: [
			"8ball"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Ask the magic 8ball a question!",
		usage: "<question>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			const responses = [
				"It is certain",
				"Without a doubt",
				"Most likely",
				"Yes",
				"Reply was hazy, try again later",
				"Ask again later",
				"My answer is no",
				"No",
				"Very doubtful"
			],
				response = responses[Math.floor(Math.random() * responses.length)];
			return msg.reply(`The Magic 8ball said **${response}**.`);
		})
	})
	.addCommand({
		triggers: [
			"awoo",
			"howl"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Start a howl, or join in!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.channel.awoo !== undefined && msg.channel.awoo.active) {
				if (msg.channel.awoo.inAwoo.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this awoo!`);
				clearTimeout(msg.channel.awoo.timeout);
				msg.channel.awoo.inAwoo.push(msg.author.id);
				const txt = "<:Awoo:596965580481888258>".repeat(msg.channel.awoo.inAwoo.length);
				msg.channel.createMessage(`<@!${msg.author.id}> joined a howl with ${msg.channel.awoo.inAwoo.length} furs!\nJoin in using \`${msg.gConfig.prefix}awoo\`.\n${msg.channel.awoo.inAwoo.length > 30 ? "This howl is too large for emojis!" : txt}`);
				msg.channel.awoo.timeout = setTimeout((ch) => {
					delete ch.awoo;
				}, 6e4, msg.channel);
			} else {
				await msg.channel.createMessage(`<@!${msg.author.id}> started a howl!\nJoin in using \`${msg.gConfig.prefix}awoo\`.\n<:Awoo:596965580481888258>`);
				msg.channel.awoo = {
					active: true,
					inAwoo: [],
					timeout: setTimeout((ch) => {
						delete ch.awoo;
					}, 6e4, msg.channel)
				};
				return msg.channel.awoo.inAwoo.push(msg.author.id);
			}
		})
	})
	.addCommand({
		triggers: [
			"bap"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Bap someone! Ouch!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");

			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);

			if (msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) {
				return msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL("https://assets.furry.bot/bap.gif"),
					name: "bap.gif"
				});
			} else {
				return msg.channel.createMessage(text);
			}
		})
	})
	.addCommand({
		triggers: [
			"bellyrub"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Give someone a nice belly rub -w-",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text, {
				file: await this.f.getImageFromURL("https://assets.furry.bot/bellyrub.gif"),
				name: "bellyrub.gif"
			});
		})
	})
	.addCommand({
		triggers: [
			"blep"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Do a blep!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			try {
				const img = await this.f.imageAPIRequest(true, "blep");
				return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`, {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} catch (e) {
				Logger.error(e, msg.guild.shard.id);
				return msg.channel.createMessage(`<@!${msg.author.id}> did a little blep!`, {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	})
	.addCommand({
		triggers: [
			"boop"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Boop someones snoot!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text, img;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			if (msg.gConfig.commandImages) {
				if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
				img = await this.f.imageAPIRequest(true, "boop");
				if (!img.success) return msg.reply(`Image API returned an error: ${img.error.description}`);
				msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL("img.response.image"),
					name: img.response.name
				});
			} else {
				msg.channel.createMessage(text);
			}
		})
	})
	.addCommand({
		triggers: [
			"conga"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Start a conga with someone, or join in!",
		usage: "[@user]",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) {
				if (msg.channel.conga !== undefined && msg.channel.conga.active) {
					if (msg.channel.conga.inConga.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this conga!`);
					clearTimeout(msg.channel.conga.timeout);
					msg.channel.conga.inConga.push(msg.author.id);
					const txt = "<a:furdancing:596817635023519777>".repeat(msg.channel.conga.inConga.length);
					msg.channel.createMessage(`<@!${msg.author.id}> joined a conga with <@!${msg.channel.conga.member.id}>!\n<@!${msg.channel.conga.member.id}> now has ${msg.channel.conga.inConga.length} furs congaing them!\nJoin in using \`${msg.gConfig.prefix}conga\`.\n${msg.channel.conga.inConga.length > 30 ? "This conga line is too long for emojis!" : txt}`);
					msg.channel.conga.timeout = setTimeout((ch) => {
						delete ch.conga;
					}, 6e4, msg.channel);
					return;
				}
				else throw new CommandError(null, "ERR_INVALID_USAGE");
			} else {
				const member = await msg.getMemberFromArgs();
				if (!member) return msg.errorEmbed("INVALID_USER");
				await msg.channel.createMessage(`<@!${msg.author.id}> started a conga with <@!${member.id}>!\nJoin in using \`${msg.gConfig.prefix}conga\`.\n<a:furdancing:596817635023519777><a:furdancing:596817635023519777>`);
				msg.channel.conga = {
					active: true,
					member,
					inConga: [],
					timeout: setTimeout((ch) => {
						delete ch.conga;
					}, 6e4, msg.channel)
				};
				return msg.channel.conga.inConga.push(msg.author.id, member.id);
			}
		})
	})
	.addCommand({
		triggers: [
			"cuddle"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Cuddle someone!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text, img;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			if (msg.gConfig.commandImages) {
				if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
				img = await this.f.imageAPIRequest(false, "cuddle", true, true);
				if (!img.success) return msg.reply(`Image API returned an error: ${img.error.description}`);
				msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} else {
				msg.channel.createMessage(text);
			}
		})
	})
	.addCommand({
		triggers: [
			"dadjoke",
			"joke"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 4e3,
		donatorCooldown: 2e3,
		description: "Get a dadjoke!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let req, j;
			req = await phin({
				method: "GET",
				url: "https://icanhazdadjoke.com",
				headers: {
					"Accept": "application/json",
					"User-Agent": config.web.userAgent
				}
			});
			try {
				j = JSON.parse(req.body);
			} catch (e) {
				await msg.channel.createMessage("Cloudflare is being dumb and rejecting our requests, please try again later.");
				Logger.error(req.body, msg.guild.shard.id);
				await msg.channel.createMessage(`This command has been permanently disabled until Cloudflare stops giving us captchas, join our support server for updates on the status of this: <https://furry.bot/inv>.`);
				return Logger.error(e, msg.guild.shard.id);
			}

			return msg.channel.createMessage(j.joke);
		})
	})
	.addCommand({
		triggers: [
			"dictionary",
			"throw",
			"dict"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Thow a dictionary at someone to teach them some knowledge!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"divorce"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e4,
		donatorCooldown: 1.5e4,
		description: "Revoke your marriage..",
		usage: "<@member>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const member: Eris.Member = null;
			let m: UserConfig, u: Eris.User | {
				username: string;
				discriminator: string;
			} = null;
			m = await mdb.collection("users").findOne({
				id: msg.uConfig.marriage.partner
			}).then(res => new UserConfig(msg.uConfig.marriage.partner, res));
			if (!m) {
				await mdb.collection("users").insertOne({
					...{ id: msg.uConfig.marriage.partner }
					, ...config.defaults.userConfig
				});
				m = await mdb.collection("users").findOne({
					id: msg.uConfig.marriage.partner
				}).then(res => new UserConfig(msg.uConfig.marriage.partner, res));
			}

			if ([undefined, null].includes(msg.uConfig.marriage)) await msg.uConfig.edit({
				marriage: {
					married: false,
					partner: null
				}
			}).then(d => d.reload());

			if (!msg.uConfig.marriage.married) return msg.reply("You have to marry someone before you can divorce them..");
			u = await this.bot.getRESTUser(msg.uConfig.marriage.partner).catch(err => ({ username: "Unknown", discriminator: "0000" }));
			msg.channel.createMessage(`Are you sure you want to divorce **${u.username}#${u.discriminator}**? **yes** or **no**.`).then(async () => {
				const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
				if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
				if (d.content.toLowerCase() === "yes") {
					await msg.uConfig.edit({
						marriage: {
							married: false,
							partner: null
						}
					}).then(d => d.reload());
					await m.edit({
						marriage: {
							married: false,
							partner: null
						}
					}).then(d => d.reload());
					return msg.channel.createMessage(`You've divorced **${u.username}#${u.discriminator}**...`);
				} else {
					return msg.reply(`You've stayed with **${u}**!`);
				}
			});
		})
	})
	.addCommand({
		triggers: [
			"e926",
			"e9"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks",
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Get some content from E926 (SFW E621)"!,
		usage: "[tags]",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (this.activeReactChannels.includes(msg.channel.id)) return msg.reply("There is already an active reaction menu in this channel. Please wait for that one to timeout before starting another.");

			const client = this; // tslint:disable-line no-this-assignment

			const colors = {
				green: 3066993,
				gold: 15844367,
				red: 15158332
			};

			const tags = msg.args.map(a => a.replace(/,\|/g, "")).filter(t => !t.toLowerCase().startsWith("order:"));
			if (tags.length > 5) return msg.reply("you can only specify up to five (5) tags.");

			const bl = tags.filter(t => config.tagBlacklist.includes(t.toLowerCase()));
			if (bl !== null && bl.length > 0) return msg.channel.createMessage(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);

			const e = await this.e9.listPosts([...tags, "order:score"], 50, 1, null, config.tagBlacklist).then(res => res.filter(p => p.rating === "s"));

			let currentPost = 1;

			const embed: Eris.EmbedOptions = {
				title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].artist.join(", ")}`,
				url: `https://e926.net/post/show/${e[currentPost - 1].id}`,
				footer: {
					icon_url: "https://e926.net/favicon-32x32.png",
					text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score} - ${currentPost}/${e.length}`
				},
				color: e[currentPost - 1].rating === "s" ? colors.green : e[currentPost - 1].rating === "q" ? colors.gold : colors.red,
				timestamp: new Date().toISOString()
			};


			let ratelimit = false;

			const rl = setInterval(() => ratelimit = false, 3e3);

			if (["jpg", "png", "gif"].includes(e[currentPost - 1].file_ext)) embed.image = {
				width: e[currentPost - 1].width,
				height: e[currentPost - 1].height,
				url: e[currentPost - 1].file_url
			};
			else if (e[currentPost - 1].file_ext === "swf") embed.description = `This post is a flash animation, please directly view [the post](https://e926.net/post/show/${e[currentPost - 1].id}) on e926`;
			else embed.description = `This post appears to be a video, please directly view [the post](https://e926.net/post/show/${e[currentPost - 1].id}) on e926`;
			/*else embed.image = {
				width: e[currentPost - 1].width,
				height: e[currentPost - 1].height,
				url: e[currentPost - 1].file_url
			};*/

			const m = await msg.channel.createMessage({ embed });
			const q = new ReactionQueue(m);

			const r = [
				"⏮",
				"◀",
				"⏹",
				"▶",
				"⏭"
			];

			r.map(e => q.add({ type: "add", user: "@me", reaction: e }));

			let t = setTimeout(setPost.bind(this), 6e4, "EXIT");
			async function setPost(this: FurryBot, p: string | number) {
				if (ratelimit && !config.developers.includes(msg.author.id)) return msg.reply("You are being ratelimited! Please wait a bit more before navigating posts!").then(m => setTimeout(() => m.delete().catch(err => null), 5e3)).catch(err => null);
				ratelimit = true;
				clearTimeout(t);
				t = setTimeout(setPost.bind(client), 6e4, "EXIT");

				if (p === "EXIT") {
					clearTimeout(t);
					this.bot.removeListener("messageReactionAdd", f);
					if (q.entries.length > 0) {
						let count = 0;
						const cI = setInterval(async () => {
							if (q.entries.length === 0 || ++count >= 20) {
								q.destroy();
								await m.removeReactions().catch(err => null);
								clearInterval(cI);
								clearInterval(rl);
								this.activeReactChannels.splice(this.activeReactChannels.indexOf(msg.channel.id), 1);
							}
						});
					} else {
						q.destroy();
						await m.removeReactions().catch(err => null);
						clearInterval(rl);
						this.activeReactChannels.splice(this.activeReactChannels.indexOf(msg.channel.id), 1);
					}
				} else currentPost = p as number;

				if (currentPost === 0) currentPost = e.length;
				if (currentPost === e.length + 1) currentPost = 1;

				const embed: Eris.EmbedOptions = {
					title: `#${e[currentPost - 1].id}: ${e[currentPost - 1].artist.join(", ").length > 256 ? "Too many artists to list." : e[currentPost - 1].artist.join(", ")}`,
					url: `https://e926.net/post/show/${e[currentPost - 1].id}`,
					footer: {
						icon_url: "https://e926.net/favicon-32x32.png",
						text: `Rating: ${e[currentPost - 1].rating === "s" ? "Safe" : e[currentPost - 1].rating === "q" ? "Questionable" : "Explicit"} | Score: ${e[currentPost - 1].score} - ${currentPost}/${e.length}`
					},
					color: e[currentPost - 1].rating === "s" ? colors.green : e[currentPost - 1].rating === "q" ? colors.gold : colors.red,
					timestamp: new Date().toISOString()
				};

				if (["jpg", "png", "gif"].includes(e[currentPost - 1].file_ext)) embed.image = {
					width: e[currentPost - 1].width,
					height: e[currentPost - 1].height,
					url: e[currentPost - 1].file_url
				};
				else if (e[currentPost - 1].file_ext === "swf") embed.description = `This post is a flash animation, please directly view [the post](https://e926.net/post/show/${e[currentPost - 1].id}) on e926`;
				else embed.description = `This post appears to be a video, please directly view [the post](https://e926.net/post/show/${e[currentPost - 1].id}) on e926`;

				await m.edit({ embed });

			}

			const f = (async (ms: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, user: string) => {
				if (ms.id !== m.id || user !== msg.author.id || !r.includes(emoji.name)) {
					if (user !== this.bot.user.id && r.includes(emoji.name)) return q.add({
						type: "remove",
						reaction: emoji.id !== null ? `${emoji.name}:${emoji.id}` : emoji.name,
						user
					});
					else return;
				}

				switch (emoji.name) {
					case "⏮":
						await setPost.call(client, 1);
						break;

					case "◀":
						await setPost.call(client, currentPost - 1);
						break;

					case "⏹":
						await setPost.call(client, "EXIT");
						break;

					case "▶":
						await setPost.call(client, currentPost + 1);
						break;

					case "⏭":
						await setPost.call(client, e.length);
						break;

					default:
						return;
				}

				return q.add({
					type: "remove",
					reaction: emoji.name,
					user
				});
			});

			client.bot.on("messageReactionAdd", f);
			this.activeReactChannels.push(msg.channel.id);
		})
	})
	.addCommand({
		triggers: [
			"flop"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Flop onto someone! OwO",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"fur"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get a random fur image! Use **fur list** to get a list of valid types.",
		usage: "[type/list]",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const types = [
				"boop",
				"cuddle",
				"fursuit",
				"hold",
				"hug",
				"kiss",
				"lick",
				"propose"
			];
			let ln, type, req, short, extra;
			if (msg.args.length === 0) {
				ln = Math.floor(Math.random() * (types.length));
				// 0 (1) - 25: Inkbunny
				type = types[Math.floor(ln / 25)];
			} else {
				type = msg.args[0].toLowerCase();
				if (type === "list") return msg.channel.createMessage(`<@!${msg.author.id}>, Valid Values:\n**${types.join("**\n**")}**.`);
			}
			try {
				if (!type) type = "hug";
				req = await this.f.imageAPIRequest(false, type, true, true);
				short = await this.f.shortenURL(req.response.image);
				extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
				return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nType: ${this.f.ucwords(type)}`, {
					file: await this.f.getImageFromURL(req.response.image),
					name: req.response.name
				});
			} catch (error) {
				Logger.error(`Error:\n${error}`, msg.guild.shard.id);
				Logger.log(`Body: ${req}`, msg.guild.shard.id);
				return msg.channel.createMessage("Unknown API Error", {
					file: await this.f.getImageFromURL("https://fb.furcdn.net/NotFound.png"),
					name: "NotFound.png"
				});
			}
		})
	})
	.addCommand({
		triggers: [
			"furpile"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Start a furpile on someone, or join in!",
		usage: "[@user]",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) {
				if (msg.channel.furpile !== undefined && msg.channel.furpile.active) {
					if (msg.channel.furpile.inPile.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this furpile!`);
					clearTimeout(msg.channel.furpile.timeout);
					msg.channel.furpile.inPile.push(msg.author.id);
					msg.channel.createMessage(`<@!${msg.author.id}> joined a furpile on <@!${msg.channel.furpile.member.id}>!\n<@!${msg.channel.furpile.member.id}> now has ${msg.channel.furpile.inPile.length} furs on them!\nJoin in using \`${msg.gConfig.prefix}furpile\`.`);
					msg.channel.furpile.timeout = setTimeout((ch) => {
						delete ch.furpile;
					}, 6e4, msg.channel);
					return;
				}
				else throw new CommandError(null, "ERR_INVALID_USAGE");
			} else {
				const member = await msg.getMemberFromArgs();
				if (!member) return msg.errorEmbed("INVALID_USER");
				await msg.channel.createMessage(`<@!${msg.author.id}> started a furpile on <@!${member.id}>!\nJoin in using \`${msg.gConfig.prefix}furpile\`.`);
				msg.channel.furpile = {
					active: true,
					member,
					inPile: [],
					timeout: setTimeout((ch) => {
						delete ch.furpile;
					}, 6e4, msg.channel)
				};
				return msg.channel.furpile.inPile.push(msg.author.id, member.id);
			}
		})
	})
	.addCommand({
		triggers: [
			"fursuit"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get a random fursuit image!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let img, short, extra;
			img = await this.f.imageAPIRequest(false, "fursuit", true, true);
			if (img.success !== true) return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
			short = await this.f.shortenURL(img.response.image);
			extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
			msg.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
				file: await this.f.getImageFromURL(img.response.image),
				name: img.response.name
			});
		})
	})
	.addCommand({
		triggers: [
			"giphy",
			"gif"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get a gif from giphy",
		usage: "<keywords>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let embed, rq;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			rq = await phin({
				method: "GET",
				url: `https://api.giphy.com/v1/gifs/search?api_key=${config.apis.giphy.apikey}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
				parse: "json"
			});

			if (rq.body.data.length === 0) return msg.reply(`No results were found for "${msg.args.join(" ")}".`);
			embed = {
				title: `Results for "${msg.args.join(" ")}" on giphy`,
				thumbnail: {
					url: "attachment://PoweredByGiphy.png"
				},
				image: {
					url: rq.body.data[Math.floor(Math.random() * rq.body.data.length)].images.fixed_width.url
				},
				footer: {
					text: "These results are not curated by us!"
				}
			};

			return msg.channel.createMessage({ embed }, {
				file: await this.f.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
				name: "PoweredByGiphy.png"
			});
		})
	})
	.addCommand({
		triggers: [
			"glomp"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Pounce onto someone lovingly~!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let text, input;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"huff",
			"huf"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Blow someone's house down..",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text, {
				file: await this.f.getImageFromURL("https://assets.furry.bot/huff.gif"),
				name: "huff.gif"
			});
		})
	})
	.addCommand({
		triggers: [
			"hug"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Hug someone!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text, img;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			if (msg.gConfig.commandImages) {
				if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
				img = await this.f.imageAPIRequest(false, "hug", true, true);
				if (!img.success) return msg.reply(`Image API returned an error: ${img.error.description}`);
				msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} else {
				msg.channel.createMessage(text);
			}
		})
	})
	/*.addCommand({
		triggers: [
			"inkbunny",
			"ib"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles",
			"embedLinks"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Get a random image from Ink Bunny!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			return msg.reply("this command has been temporarily disabled, as it causes a lot of errors.");
		})
	})*/
	.addCommand({
		triggers: [
			"kiss"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Kiss someone 0.0",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text, img;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			if (msg.gConfig.commandImages) {
				if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
				img = await this.f.imageAPIRequest(false, "kiss", true, true);
				if (!img.success) return msg.reply(`Image API returned an error: ${img.error.description}`);
				msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} else {
				msg.channel.createMessage(text);
			}
		})
	})
	.addCommand({
		triggers: [
			"lick"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Lick someone... owo",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text, img;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			if (msg.gConfig.commandImages) {
				if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.channel.createMessage("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
				img = await this.f.imageAPIRequest(false, "lick", true, true);
				if (!img.success) return msg.reply(`Image API returned an error: ${img.error.description}`);
				msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} else {
				msg.channel.createMessage(text);
			}
		})
	})
	.addCommand({
		triggers: [
			"marry",
			"propose"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e4,
		donatorCooldown: 1.5e4,
		description: "Propose to someone!",
		usage: "<@member>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let member: Eris.Member, m: UserConfig, u: Eris.User | string;
			member = await msg.getMemberFromArgs();
			if (!member) return msg.errorEmbed("INVALID_USER");
			m = await mdb.collection("users").findOne({
				id: member.id
			}).then(res => new UserConfig(member.id, res));
			if (!m) {
				await mdb.collection("users").insertOne({
					...{ id: member.id }
					, ...config.defaults.userConfig
				});
				m = await mdb.collection("users").findOne({
					id: member.id
				}).then(res => new UserConfig(member.id, res));
			}

			if ([undefined, null].includes(msg.uConfig.marriage)) await msg.uConfig.edit({
				marriage: {
					married: false,
					partner: null
				}
			}).then(d => d.reload());

			if (msg.uConfig.marriage.married) {
				u = await this.bot.getRESTUser(msg.uConfig.marriage.partner).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
				return msg.reply(`Hey, hey! You're already married to **${u}**! You can get a divorce though..`);
			}

			if (m.marriage.married) {
				u = await this.bot.getRESTUser(m.marriage.partner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
				return msg.reply(`Hey, hey! They're already married to **${u}**!`);
			}
			msg.channel.createMessage(`<@!${msg.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.`).then(async () => {
				const d = await this.MessageCollector.awaitMessage(msg.channel.id, member.id, 6e4);
				if (!d) return msg.reply("Seems like we didn't get a reply..");
				if (!["yes", "no"].includes(d.content.toLowerCase())) return msg.channel.createMessage(`<@!${member.id}>, that wasn't a valid option..`);
				if (d.content.toLowerCase() === "yes") {
					await msg.uConfig.edit({
						marriage: {
							married: true,
							partner: member.id
						}
					}).then(d => d.reload());
					await m.edit({
						marriage: {
							married: true,
							partner: msg.author.id
						}
					}).then(d => d.reload());
					return msg.channel.createMessage(`Congrats <@!${msg.author.id}> and <@!${member.id}>!`);
				} else {
					return msg.reply("Better luck next time!");
				}
			});
		})
	})
	.addCommand({
		triggers: [
			"nap"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Flop onto someone.. then take a nap?",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			/*if (msg.gConfig.commandImages) {
				if (!msg.channel.permissionsOf(this.user.id).has("attachFiles")) return msg.channel.createMessage(`<@!${msg.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
				img = await this.f.imageAPIRequest(false, "nap", true, true);
				if (!img.success) return msg.reply(`Image API returned an error: ${img.error.description}`);
				msg.channel.createMessage(text, {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} else {*/
			msg.channel.createMessage(text);
			// }
		})
	})
	.addCommand({
		triggers: [
			"nuzzle"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Nuzzle someone!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"pat",
			"pet"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Pat someone uwu",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"poke"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Poke someone!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"pounce"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Pounce on someone! uwu",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text, {
				file: await this.f.getImageFromURL("https://assets.furry.bot/pounce.gif"),
				name: "pounce.gif"
			});
		})
	})
	.addCommand({
		triggers: [
			"roll"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Roll the dice.",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let min, max;
			min = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 1;
			max = typeof msg.args[1] !== "undefined" ? parseInt(msg.args[1], 10) : 20;

			return msg.channel.createMessage(`<@!${msg.author.id}>, you rolled a ${_.random(min, max)}!`);
		})
	})
	.addCommand({
		triggers: [
			"russianroulette",
			"roulette",
			"rr"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Play Russian Roulette!",
		usage: "[bullets]",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let val, bullets;
			val = Math.floor(Math.random() * 6);
			bullets = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 3;

			if (val <= bullets - 1) return msg.channel.createMessage(`<@!${msg.author.id}>, You died!`);
			return msg.channel.createMessage(`<@!${msg.author.id}>, You lived!`);
		})
	})
	.addCommand({
		triggers: [
			"ship"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles",
			"embedLinks"
		],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Ship some people!",
		usage: "<@member1> [@member2]",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			return msg.reply("this command has been temporarily disabled, as it does not work properly. It should be fixed soon!");

			/*if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let user1: Eris.Member | Eris.User, user2: Eris.Member | Eris.User, rand1: number, rand2: number, r1: number, r2: number, shipname: string, amount: number, u1: string[], u2: string[], profile1: Buffer, profile2: Buffer, embed: Eris.EmbedOptions, tt: Eris.Member[];
			if (msg.args[0] === "random") {
				tt = msg.channel.guild.members.filter(u => u.id !== msg.author.id && !u.user.bot);
				user1 = tt[Math.floor(Math.random() * tt.length)];
			} else user1 = await msg.getUserFromArgs(0, false, false, 0);

			// 2
			if (msg.args.length > 1) {
				if (msg.args[1] === "random") {
					if (!user1) { } else {
						tt = msg.channel.guild.members.filter(u => u.id !== user1.id && u.id !== msg.author.id && !u.user.bot);
						user2 = tt[Math.floor(Math.random() * tt.length)];
					}
				} else user2 = await msg.getUserFromArgs(1, false, false, 1);
			}
			if (!user1) return msg.errorEmbed("INVALID_USER");
			if (user1 instanceof Eris.Member) user1 = user1.user;
			if (user2 instanceof Eris.Member) user2 = user2.user;
			if (!user2) user2 = msg.author;

			if (user1.id === user2.id) {
				return msg.reply("that's a bit self centered...");
			}

			try {
				rand1 = Math.floor(Math.random() * 3),
					rand2 = Math.floor(Math.random() * 3);

				if (rand1 < 2) rand1 += 2;
				if (rand2 < 2) rand2 += 2;

				r1 = Math.round(user1.username.length / rand1),
					r2 = Math.round(user2.username.length / rand2);

				shipname = user1.username.substr(0, r1) + user2.username.substr(user2.username.length - r2, r2);
				amount = Math.floor(Math.random() * 101);
				const heart = [undefined, null].includes(amount) ? "unknown" : amount <= 1 ? "1" : amount >= 2 && amount <= 19 ? "2-19" : amount >= 20 && amount <= 39 ? "20-39" : amount >= 40 && amount <= 59 ? "40-59" : amount >= 60 && amount <= 79 ? "60-79" : amount >= 80 && amount <= 99 ? "80-99" : amount === 100 ? "100" : "unknown",
					shiptext = [undefined, null].includes(amount) ? "unknown" : amount <= 1 ? "Not Happening.." : amount >= 2 && amount <= 19 ? "Unlikely.." : amount >= 20 && amount <= 39 ? "Maybe?" : amount >= 40 && amount <= 59 ? "Hopeful!" : amount >= 60 && amount <= 79 ? "Good!" : amount >= 80 && amount <= 99 ? "Amazing!" : amount === 100 ? "Epic!" : "unknown",
					heartIcon = await fs.readFileSync(`${config.rootDir}/src/assets/images/ship/ship-${heart}-percent.png`);
				u1 = user1.avatarURL.split(".");
				u1.pop();
				profile1 = await this.f.getImageFromURL(`${u1.join(".")}.png`);
				u2 = user2.avatarURL.split(".");
				u2.pop();
				profile2 = await this.f.getImageFromURL(`${u2.join(".")}.png`);
				const img = new Canvas(384, 128)
					.addImage(profile1, 0, 0, 128, 128)
					.addImage(heartIcon, 128, 0, 128, 128)
					.addImage(profile2, 256, 0, 128, 128);
				const file = await img.toBufferAsync();
				embed = {
					title: ":heart: **Shipping!** :heart:",
					description: `Shipping **${user1.username}#${user1.discriminator}** with **${user2.username}#${user2.discriminator}**\n**${amount}%** - ${shiptext}\nShipname: ${shipname}`,
					image: {
						url: "attachment://ship.png"
					}
				};
				Object.assign(embed, msg.embed_defaults());
				await msg.channel.createMessage({
					embed
				}, {
					file,
					name: "ship.png"
				});
			} catch (e) {
				Logger.error({
					shipname,
					amount
				}, msg.guild.shard.id);
				throw e;
			}*/
		})
	})
	.addCommand({
		triggers: [
			"slap"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Slap someone..",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"sniff"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Sniff someone..?",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"snowball"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Throw a snowball at someone!",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			let input, text;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"sofurry",
			"sf"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles",
			"embedLinks"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Get a random post from sofurry!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			// saved for when sofurry api has issues
			// return msg.channel.createMessage(`<@!${msg.author.id}>, Sorry, sofurry is having issues right now, and we cannot fetch anything from their api.\n(if it's back, and I haven't noticed, let me know in my support server - https://discord.gg/SuccpZw)`);
			const contentType = [
				"story",
				"art",
				"music",
				"journal",
				"photo"
			];
			let tags, bl, req, jsn, rr, submission, short, extra;
			tags = msg.unparsedArgs.length > 0 ? msg.unparsedArgs.join("%20") : "furry";
			bl = tags.match(config.tagBlacklist);
			if (bl !== null && bl.length > 0) return msg.channel.createMessage(`<@!${msg.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
			const m = await msg.channel.createMessage(`Fetching.. <a:loading:592976588761726977>`);
			req = await phin({
				method: "GET",
				url: `https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,
				headers: {
					"User-Agent": config.web.userAgent
				}
			});
			if (req.body.toString().indexOf("block.opendns.com") !== -1) return msg.reply("This command is blocked on the current network the bot is being ran on.");
			try {
				jsn = JSON.parse(req.body.toString());
				rr = Math.floor(Math.random() * jsn.data.entries.length);
				submission = jsn.data.entries[rr];
				if (typeof submission.contentLevel === "undefined") throw new Error("secondary");
				if (submission.contentLevel !== 0) {
					Logger.log(`unsafe image:\n${util.inspect(submission, { depth: 3, showHidden: true })}`, msg.guild.shard.id);
					Logger.log(`Body: ${util.inspect(jsn, { depth: null })}`, msg.guild.shard.id);
					return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => msg.channel.createMessage(`Command failed: ${err}`));
				}
				short = await this.f.shortenURL(`http://www.sofurry.com/view/${submission.id}`);
				extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
				if ([1, 4].includes(submission.contentType)) return m.edit(`${extra}${submission.title} (type ${this.f.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err => msg.channel.createMessage(`Command failed: ${err}`)).then(async () => msg.channel.createMessage("", {
					file: await this.f.getImageFromURL(submission.full),
					name: "sofurry.png"
				}));
				else return m.edit(`${extra}${submission.title} (type ${this.f.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nIf something bad is returned, blame the service, not the bot author!`).catch(err => msg.channel.createMessage(`Command failed: ${err}`));
			} catch (e) {
				Logger.error(`Error:\n${e}`, msg.guild.shard.id);
				Logger.log(`Body: ${req.body}`, msg.guild.shard.id);
				return m.edit("Unknown API Error").then(async () => msg.channel.createMessage("", {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				})).catch(err => msg.channel.createMessage(`Command failed: ${err}`));
			}
			/* eslint-enable no-unreachable */
		})
	})
	.addCommand({
		triggers: [
			"spray"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Spray someone with a bottle of water..",
		usage: "<@member/text>",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let input, text;
			input = msg.args.join(" ");
			text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.lang, cmd), msg.author.mention, input);
			msg.channel.createMessage(text);
		})
	})
	.addCommand({
		triggers: [
			"whosagoodboy",
			"whosagoodboi",
			"goodboy",
			"goodboi"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 1e3,
		donatorCooldown: .5e3,
		description: "Who's a good boy?!",
		usage: "",
		features: [],
		category: "fun",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			return msg.reply("Yip! Yip! I am! I am! :fox::fox:");
		})
	});

export default null;
