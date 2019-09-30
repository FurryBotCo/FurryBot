import FurryBot from "../../main";
import config from "../../config";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import { mdb } from "../../modules/Database";
import * as Eris from "eris";
import phin from "phin";
import { Command, CommandError } from "../../util/CommandHandler";
import CmdHandler from "../../util/cmd";

type CommandContext = FurryBot & { _cmd: Command };


export default [
	new Command(true, {
		triggers: [
			"game"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Change the bots game.",
		usage: "<type> <game>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length <= 1) return new CommandError(null, "ERR_INVALID_USAGE");
			let type;
			switch (msg.args[0].toLowerCase()) {
				case "playing":
					type = 0;
					break;

				case "streaming":
					type = 1;
					break;

				case "listening":
					type = 2;
					break;

				case "watching":
					type = 3;
					break;

				default:
					return msg.channel.createMessage(`<@!${msg.author.id}>, invalid type. Possible types: **playing**, **listening**, **watching**, **streaming**.`);
			}
			msg.args.shift();
			let status = this.bot.shards.get(0).presence.status;
			// this.shards.get(0).presence.status
			// this.guilds.filter(g => g.members.has(this.user.id))[0].members.get(this.user.id).status
			if (!status) status = "online";

			if (type === 1) return this.bot.editStatus(status, { url: msg.args.shift(), name: msg.args.join(" "), type });
			else return this.bot.editStatus(status, { name: msg.args.join(" "), type });
			// this.editStatus("online", { name: msg.args.join(" "),type })
		})
	}, CmdHandler),
	new Command(true, {
		triggers: [
			"icon"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Check the bots icon.",
		usage: "<url>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.unparsedArgs.length === 0) return new CommandError(null, "ERR_INVALID_USAGE");
			const set = await phin({ url: msg.unparsedArgs.join("%20"), parse: "none" }).then(res => `data:${res.headers["content-type"]};base64,${res.body.toString("base64")}`);
			this.bot.editSelf({ avatar: set })
				.then(async (user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set Avatar to (attachment)`, {
					file: await this.f.getImageFromURL(user.avatarURL),
					name: "avatar.png"
				}))
				.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
		})
	}, CmdHandler),
	new Command(true, {
		triggers: [
			"name",
			"username"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Change the bots username.",
		usage: "<username>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.unparsedArgs.length === 0) return new CommandError(null, "ERR_INVALID_USAGE");
			let set;
			set = msg.unparsedArgs.join(" ");
			if (set.length < 2 || set.length > 32) return msg.channel.createMessage("Username must be between **2** and **32** characters.");
			this.bot.editSelf({ username: set })
				.then((user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set username to: ${user.username}`))
				.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
		})
	}, CmdHandler),
	new Command(true, {
		triggers: [
			"status"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Change the bots status.",
		usage: "<status>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length <= 0) return new CommandError(null, "ERR_INVALID_USAGE");
			const types = ["online", "idle", "dnd", "invisible"];
			if (!types.includes(msg.args[0].toLowerCase())) return msg.channel.createMessage(`<@!${msg.author.id}>, invalid type. Possible types: **${types.join("**, **")}**.`);
			const game = this.bot.guilds.filter(g => g.members.has(this.bot.user.id))[0].members.get(this.bot.user.id).game;

			try {
				this.bot.editStatus(msg.args[0].toLowerCase(), game);
				return msg.reply(`set bots status to ${msg.args[0].toLowerCase()}`);
			} catch (e) {
				return msg.reply(`There was an error while doing this: ${e}`);
			}
		})
	}, CmdHandler)
];
