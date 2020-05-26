import Command from "../../modules/CommandHandler/Command";
import { Utility } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";

export default new Command({
	triggers: [
		"bancount"
	],
	permissions: {
		user: [
			"viewAuditLogs"
		],
		bot: [
			"viewAuditLogs",
			"banMembers"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
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
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.utility.bancount.total}: ${b.length}`)
			.setDescription(Object.keys(k).map(j => `<@!${j}>: ${k[j]}`).join("\n"))
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.toJSON()
	});
}));
