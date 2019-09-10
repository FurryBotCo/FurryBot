import client from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import { Command, CommandError } from "../util/CommandHandler";
import * as Eris from "eris";

type CommandContext = FurryBot & { _cmd: Command };

client.cmdHandler
	.addCategory({
		name: "meme",
		displayName: ":joy: Memey",
		devOnly: false,
		description: "Let's get this bread."
	})
	.addCommand({
		triggers: [
			"aborted",
			"abort"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Why someone should've been aborted",
		usage: "[image]",
		features: [],
		category: "meme",
		run: (async function (this: CommandContext, msg: ExtendedMessage) {
			let user, imgurl, req, j;
			if (msg.args.length >= 1) {
				// get member from message
				user = await msg.getMemberFromArgs();

				imgurl = user instanceof Eris.Member ? user.user.staticAvatarURL : msg.unparsedArgs.join("%20");
			} else if (msg.attachments[0]) imgurl = msg.attachments[0].url;
			else imgurl = msg.author.staticAvatarURL;
			if (!imgurl) return msg.reply("please either attach an image or provide a url");
			const test = await this.f.validateURL(imgurl);
			if (!test) return msg.reply("either what you provided wasn't a valid url, or the server responded with a non-200 OK response.");
			req = await this.f.memeRequest("/aborted", [imgurl]);
			if (req.statusCode !== 200) {
				try {
					j = { status: req.statusCode, message: JSON.stringify(req.body) };
				} catch (error) {
					j = { status: req.statusCode, message: req.body };
				}
				msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
				return this.logger.log(`imgurl: ${imgurl}`, msg.guild.shard.id);
			}
			return msg.channel.createMessage("", {
				file: req.body,
				name: "aborted.png"
			}).catch(err => msg.reply(`Error sending: ${err}`));
		})
	})
	.addCommand({
		triggers: [
			"affect"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "My baby won't be affected.",
		usage: "[image]",
		features: [],
		category: "meme",
		run: (async function (this: CommandContext, msg: ExtendedMessage) {
			let user, imgurl, req, j;
			if (msg.args.length >= 1) {
				// get member from message
				user = await msg.getMemberFromArgs();
				imgurl = user instanceof Eris.Member ? user.user.staticAvatarURL : msg.unparsedArgs.join("%20");
			} else if (msg.attachments[0]) imgurl = msg.attachments[0].url;
			else imgurl = msg.author.staticAvatarURL;

			if (!imgurl) return msg.reply("please either attach an image or provide a url");
			const test = await this.f.validateURL(imgurl);
			if (!test) return msg.reply("either what you provided wasn't a valid url, or the server responded with a non-200 OK response.");
			req = await this.f.memeRequest("/affect", [imgurl]);
			if (req.statusCode !== 200) {
				try {
					j = { status: req.statusCode, message: JSON.stringify(req.body) };
				} catch (error) {
					j = { status: req.statusCode, message: req.body };
				}
				msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
				return this.logger.log(`imgurl: ${imgurl}`, msg.guild.shard.id);
			}
			msg.channel.createMessage("", {
				file: req.body,
				name: "affect.png"
			}).catch(err => msg.reply(`Error sending: ${err}`));
		})
	})
	.addCommand({
		triggers: [
			"armor"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Nothing can penetrate my armor.",
		usage: "<text>",
		features: [],
		category: "meme",
		run: (async function (this: CommandContext, msg: ExtendedMessage) {
			let text, req, j;
			text = msg.unparsedArgs.join(" ");
			if (text.length === 0) text = "Provide some text";
			req = await this.f.memeRequest("/armor", [], text);
			if (req.statusCode !== 200) {
				try {
					j = { status: req.statusCode, message: JSON.stringify(req.body) };
				} catch (error) {
					j = { status: req.statusCode, message: req.body };
				}
				msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
				return this.logger.log(`text: ${text}`, msg.guild.shard.id);
			}
			return msg.channel.createMessage("", {
				file: req.body,
				name: "armor.png"
			}).catch(err => msg.reply(`Error sending: ${err}`));
		})
	})
	.addCommand({
		triggers: [
			"balloon"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Nothing will pop this.",
		usage: "<text>",
		features: [],
		category: "meme",
		run: (async function (this: CommandContext, msg: ExtendedMessage) {
			let text, req, j;
			text = msg.unparsedArgs.join(" ");
			if (text.length === 0) text = "Image api, not providing text";
			req = await this.f.memeRequest("/balloon", [], text);
			if (req.statusCode !== 200) {
				try {
					j = { status: req.statusCode, message: JSON.stringify(req.body) };
				} catch (error) {
					j = { status: req.statusCode, message: req.body };
				}
				msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
				return this.logger.log(`text: ${text}`, msg.guild.shard.id);
			}
			return msg.channel.createMessage("", {
				file: req.body,
				name: "balloon.png"
			}).catch(err => msg.reply(`Error sending: ${err}`));
		})
	})
	.addCommand({
		triggers: [
			"gay",
			"homo"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 5e3,
		donatorCooldown: 2.5e3,
		description: "Gay up an image.",
		usage: "[image]",
		features: [],
		category: "meme",
		run: (async function (this: CommandContext, msg: ExtendedMessage) {
			let user, imgurl, req, j;
			if (msg.args.length >= 1) {
				// get member from message
				user = await msg.getUserFromArgs();
				imgurl = user instanceof Eris.User ? user.staticAvatarURL : msg.unparsedArgs.join("%20");
			} else if (msg.attachments[0]) imgurl = msg.attachments[0].url;
			else imgurl = msg.author.staticAvatarURL;

			if (!imgurl) return msg.reply("please either attach an image or provide a url");
			const test = await this.f.validateURL(imgurl);
			if (!test) return msg.reply("either what you provided wasn't a valid url, or the server responded with a non-200 OK response.");
			req = await this.f.memeRequest("/gay", [imgurl]);
			if (req.statusCode !== 200) {
				try {
					j = { status: req.statusCode, message: JSON.stringify(req.body) };
				} catch (error) {
					j = { status: req.statusCode, message: req.body };
				}
				msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
				return this.logger.log(`imgurl: ${imgurl}`, msg.guild.shard.id);
			}
			return msg.channel.createMessage("", {
				file: req.body,
				name: "gay.png"
			}).catch(err => msg.reply(`Error sending: ${err}`));
		})
	})
	.addCommand({
		triggers: [
			"mock"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles",
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Mock some text",
		usage: "<text>",
		features: [],
		category: "meme",
		run: (async function (this: CommandContext, msg: ExtendedMessage) {
			if (msg.unparsedArgs.length < 1) throw new CommandError(null, "ERR_INVALID_USAGE");

			const embed: Eris.EmbedOptions = {
				title: "Mocking Text",
				description: this.f.everyOtherUpper(msg.unparsedArgs.join(" ")),
				image: {
					url: "https://assets.furry.bot/mock.png"
				},
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			};

			return msg.channel.createMessage({ embed });
		})
	});

export default null;