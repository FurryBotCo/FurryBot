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
		"ping",
		"pong"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	donatorCooldown: .25e3,
	description: "Get my average ping.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	return msg.channel.createMessage("Checking Ping..")
		.then(m => m.edit("Ping Calculated!"))
		.then(async (m) => {
			await msg.channel.createMessage(`Client Ping: ${+m.timestamp - +msg.timestamp}ms${"\n"}Shard Ping: ${Math.round(msg.guild.shard.latency)}ms`);
			return m.delete();
		});
}));
