import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"stats",
		"statistics"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Get bot statistics",
	usage: "[stat]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const stats = {
		guilds: this.guilds.size,
		shards: this.shards.size,
		channels: Object.keys(this.channelGuildMap).length,
		users: this.users.size,
		uptime: this.f.parseTime(process.uptime())
	};

	if (msg.args.length === 0 || !Object.keys(stats).includes(msg.args[0].toLowerCase())) return msg.reply(`invalid statistic, valid options: **${Object.keys(stats).join("**, **")}**`);

	const st = msg.args[0].toLowerCase();

	return msg.channel.createMessage({
		embed: {
			title: "Statistics",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			color: Colors.gold,
			timestamp: new Date().toISOString(),
			description: `${this.f.ucwords(st)}: ${stats[st]}`
		}
	});
}));
