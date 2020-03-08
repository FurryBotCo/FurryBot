import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Utility } from "../../util/Functions";
import Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"bancount"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	description: "Get the number of bans preformed per user.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const b: Eris.GuildAuditLogEntry[] = [];

	async function get(a?: string) {
		const { entries } = await msg.channel.guild.getAuditLogs(100, a || null, Eris.Constants.AuditLogActions.MEMBER_BAN_ADD);

		b.push(...entries);
		if (entries.length === 100) return get(entries[99].id);
		else return;
	}

	await get(null);

	const k = {};

	b.map(e => !k[e.user.id] ? k[e.user.id] = 1 : k[e.user.id]++);

	return msg.channel.createMessage({
		embed: {
			title: `Total Bans Fetched: ${b.length}`,
			description: [
				...Object.keys(k).map(j => `<@!${j}>: ${k[j]}`)
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.green
		}
	});
}));
