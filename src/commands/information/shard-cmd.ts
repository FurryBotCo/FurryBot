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
		"shard"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get some info about your servers current shard.",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const embed: Eris.EmbedOptions = {
		title: "Shard Info",
		description: `Guilds: ${this.guilds.filter(g => g.shard.id === msg.guild.shard.id).length}\nPing: ${msg.guild.shard.latency}ms`,
		color: this.f.randomColor(),
		timestamp: new Date().toISOString()
	};

	return msg.channel.createMessage({
		embed
	});
}));
