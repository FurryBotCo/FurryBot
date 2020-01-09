import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Logger } from "../../../../util/LoggerV8";
import { db, mdb } from "../../../../modules/Database";
import Eris from "eris";
import { BlacklistEntry } from "../../../../util/@types/Misc";

export default new SubCommand({
	triggers: [
		"guild",
		"g",
		"server",
		"s"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a serer is blacklisted.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const id = msg.args[0];
	if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
	const gbl: BlacklistEntry[] = await mdb.collection("blacklist").find({ guildId: id }).toArray();

	if (gbl.length > 0) {
		const expired = gbl.filter(b => b.expire > Date.now() && ![0, null].includes(b.expire));
		const current = gbl.filter(b => [0, null].includes(b.expire) || b.expire <= Date.now());
		if (current.length > 0) return msg.channel.createMessage(`The guild **${id}** is blacklisted. Here's those entries:\n**Expired**:\n${expired.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}\n\n**Current**:\n${current.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}`);
		else return msg.channel.createMessage(`The guild **${id}** is not currently blacklisted, but it has some previous blacklists. Here's those entries:\n**Expired**:\n${expired.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}\n\n**Current**:\n${current.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}`);
	}
	else return msg.reply(`**${id}** is not blacklisted.`);
}));
