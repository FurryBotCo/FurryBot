import client from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import phin from "phin";
import { Command } from "../util/CommandHandler";
import CmdHandler from "../util/cmd";
import { Logger } from "@donovan_dmc/ws-clusters";

type CommandContext = FurryBot & { _cmd: Command };

CmdHandler
	.addCategory({
		name: "animals",
		displayName: ":dog: Animals",
		devOnly: false,
		description: "Cute little animals to brighten your day!"
	})
	.addCommand({
		triggers: [
			"bird",
			"birb"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Get a picture of a birb!",
		usage: "",
		features: [],
		category: "animals",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const img = await this.f.imageAPIRequest(true, "birb");
			try {
				return msg.channel.createMessage("", {
					file: await this.f.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} catch (e) {
				Logger.error(e, msg.guild.shard.id);
				return msg.channel.createMessage("unknown api error", {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	})
	.addCommand({
		triggers: [
			"cat"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Get a picture of a cat!",
		usage: "",
		features: [],
		category: "animals",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			try {
				return msg.channel.createMessage("", {
					file: await this.f.getImageFromURL("https://cataas.com/cat/gif"),
					name: "cat.gif"
				});
			} catch (e) {
				Logger.error(e, msg.guild.shard.id);
				return msg.channel.createMessage("unknown api error", {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	})
	.addCommand({
		triggers: [
			"dog",
			"doggo",
			"puppy"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Get a picture of a doggo!",
		usage: "",
		features: [],
		category: "animals",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let req, j, parts;
			try {
				req = await phin({
					method: "GET",
					url: "https://dog.ceo/api/breeds/image/random",
					headers: {
						"User-Agent": config.web.userAgent
					}
				});
				j = JSON.parse(req.body);
				parts = j.message.replace("https://", "").split("/");

				return msg.channel.createMessage(`Breed: ${parts[2]}`, {
					file: await this.f.getImageFromURL(j.message),
					name: `${parts[2]}_${parts[3]}.png`
				});
			} catch (e) {
				Logger.error(e, msg.guild.shard.id);
				Logger.error(j, msg.guild.shard.id);
				return msg.channel.createMessage("unknown api error", {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	})
	.addCommand({
		triggers: [
			"fox",
			"foxxo",
			"foxyboi"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Get a picture of a fox!",
		usage: "",
		features: [],
		category: "animals",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			try {
				return msg.channel.createMessage("", {
					file: await this.f.getImageFromURL("https://foxrudor.de/"),
					name: "foxrudor.de.png"
				});
			} catch (e) {
				Logger.error(e, msg.guild.shard.id);
				return msg.channel.createMessage("unknown api error", {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	})
	.addCommand({
		triggers: [
			"snek",
			"snake",
			"noodle",
			"dangernoodle"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Get a picture of a snek!",
		usage: "",
		features: [],
		category: "animals",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let req, j;
			try {
				req = await phin({
					method: "GET",
					url: "https://api.chewey-bot.ga/snake",
					headers: {
						"User-Agent": config.web.userAgent,
						"Authorization": config.apis.chewyBot.key
					}
				});
				j = JSON.parse(req.body);

				return msg.channel.createMessage("", {
					file: await this.f.getImageFromURL(j.data),
					name: j.data.split("/").reverse()[0]
				});
			} catch (e) {
				Logger.error(e, msg.guild.shard.id);
				Logger.error(j, msg.guild.shard.id);
				return msg.channel.createMessage("unknown api error", {
					file: await this.f.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	});

export default null;
