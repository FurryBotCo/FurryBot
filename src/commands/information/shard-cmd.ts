import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

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
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const embed: Eris.EmbedOptions = {
		title: "Shard Info",
		description: `Guilds: ${this.guilds.filter(g => g.shard.id === msg.guild.shard.id).length}\nPing: ${msg.guild.shard.latency}ms`,
		color: Colors.gold,
		timestamp: new Date().toISOString()
	};

	return msg.channel.createMessage({
		embed
	});
}));
