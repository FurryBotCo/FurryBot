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
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a user is blacklisted.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	const { id } = u;
	const ubl: BlacklistEntry[] = await mdb.collection("blacklist").find({ userId: id }).toArray();

	if (ubl.length > 0) {
		const expired = ubl.filter(b => b.expire < Date.now() && ![0, null].includes(b.expire));
		const current = ubl.filter(b => [0, null].includes(b.expire) || b.expire > Date.now());
		if (current.length > 0) return msg.channel.createMessage(`The user **${u.username}#${u.discriminator}** is blacklisted. Here's those entries:\n**Expired**:\n${expired.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}\n\n**Current**:\n${current.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}`);
		else return msg.channel.createMessage(`The user **${u.username}#${u.discriminator}** is not currently blacklisted, but they have some previous blacklists. Here's those entries:\n**Expired**:\n${expired.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}\n\n**Current**:\n${current.map((b, i) => `${i + 1}.) Date: ${this.f.formatDateWithPadding(new Date(b.created), true)}\n\tBlame: ${b.blame}\n\tReason: ${b.reason}\n\tExpiry: ${[0, null].includes(b.expire) ? "Never" : this.f.formatDateWithPadding(new Date(b.expire))}\n\tID: ${b.id}`).join("\n") || "None"}`);
	}
	else return msg.reply(`**${u.username}#${u.discriminator}** is not blacklisted.`);
}));
