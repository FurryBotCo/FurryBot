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
		"shard"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get some info about your servers current shard",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	const embed: Eris.EmbedOptions = {
		title: "Shard Info",
		description: `Guilds: ${this.guilds.filter(g => g.shard.id === msg.guild.shard.id).length}\nPing: ${msg.guild.shard.latency}ms`,
		color: functions.randomColor(),
		timestamp: new Date().toISOString()
	};

	return msg.channel.createMessage({
		embed
	});
}));