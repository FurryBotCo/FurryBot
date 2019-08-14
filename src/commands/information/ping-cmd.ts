import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"ping",
		"pong"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	description: "Get the bots ping",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	await msg.channel.createMessage("Checking Ping..")
		.then(m => m.edit("Ping Calculated!"))
		.then(async (m) => {
			await msg.channel.createMessage(`Client Ping: ${+m.timestamp - +msg.timestamp}ms${"\n"}Shard Ping: ${Math.round(msg.guild.shard.latency)}ms`);
			return m.delete();
		});
}));