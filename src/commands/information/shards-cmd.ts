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
		"shards"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get some info about the shards of the bot",
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
		fields: this.shards.map(s => ({
			name: `Shard #${s.id}`,
			value: `Guilds: ${this.guilds.filter(g => g.shard.id === s.id).length}\nPing: ${s.latency !== Infinity ? `${s.latency}ms` : "N/A"}\nStatus: ${s.status}`,
			inline: true
		})),
		color: functions.randomColor(),
		timestamp: new Date().toISOString()
	};

	embed.fields[msg.guild.shard.id].name = `Shard #${msg.guild.shard.id} (current)`;

	return msg.channel.createMessage({
		embed
	});
}));