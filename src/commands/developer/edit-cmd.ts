import Command from "../../modules/CommandHandler/Command";
import { Request } from "../../util/Functions";
import phin from "phin";
import Eris from "eris";

export default new Command({
	triggers: [
		"edit"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.unparsedArgs.length > 2) return new Error("ERR_INVALID_USAGE");

	switch (msg.args[0].toLowerCase()) {
		case "game": {
			let type;
			switch (msg.args[1].toLowerCase()) {
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

			if (type === 1) return this.editStatus(msg.channel.guild.shard.presence.status, { url: msg.args[2], name: msg.args.slice(3).join(" "), type });
			else return this.editStatus(msg.channel.guild.shard.presence.status, { name: msg.args.slice(2).join(" "), type });
			break;
		}

		case "icon": {
			if (msg.unparsedArgs.length > 2) return new Error("ERR_INVALID_USAGE");
			const set = await phin({
				url: msg.unparsedArgs.slice(1).join("%20"),
				timeout: 5e3
			}).then(res => `data:${res.headers["content-type"]};base64,${Buffer.from(res.body.toString()).toString("base64")}`);
			this.editSelf({ avatar: set })
				.then(async (user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set Avatar to (attachment)`, {
					file: await Request.getImageFromURL(user.avatarURL),
					name: "avatar.png"
				}))
				.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
			break;
		}

		case "name": {
			if (msg.unparsedArgs.length > 2) return new Error("ERR_INVALID_USAGE");
			const username = msg.unparsedArgs.slice(1).join(" ");
			if (username.length < 2 || username.length > 32) return msg.channel.createMessage("Username must be between **2** and **32** characters.");
			return this.editSelf({ username })
				.then((user) => msg.reply(`set username to "${user.username}"`))
				.catch((err) => msg.reply(`there was an error while doing this: ${err}`));
			break;
		}

		case "status": {
			if (msg.args.length > 2) return new Error("ERR_INVALID_USAGE");
			const types: Eris.Status[] = ["online", "idle", "dnd", "offline"];
			if (!types.includes(msg.args[1].toLowerCase() as Eris.Status)) return msg.reply(`invalid type. Valid types: **${types.join("**, **")}**.`);

			try {
				this.editStatus(msg.args[1].toLowerCase() as Eris.Status, msg.channel.guild.shard.presence.game);
				return msg.reply(`set bots status to ${msg.args[1].toLowerCase()}`);
			} catch (e) {
				return msg.reply(`There was an error while doing this: ${e}`);
			}
		}

		default: {
			return msg.reply("invalud subcommand.");
		}
	}
}));
