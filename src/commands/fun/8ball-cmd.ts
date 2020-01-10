import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
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
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	return msg.channel.createMessage({
		embed: {
			title: `${msg.author.tag}'s Magic 8ball Game`,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `The Magic 8ball said: "**${config.bot.cmd8ball[Math.floor(Math.random() * config.bot.cmd8ball.length)]}**."`,
			footer: {
				text: "Disclaimer: Do not take any answers seriously!",
				icon_url: "https://i.furry.bot/furry.png"
			},
			timestamp: new Date().toISOString()
		}
	});
}));
