import Command from "../../util/CommandHandler/lib/Command";
import Eris from "eris";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"bancount"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	features: [],
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
	});


}));
