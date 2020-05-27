import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility } from "../util/Functions";

export default new ClientEvent("guildRoleCreate", (async function (this: FurryBot, guild: Eris.Guild, role: Eris.Role) {
	this.track("events", "guildRoleCreate");
	const g = await db.getGuild(guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "roleCreate");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);
	if (!ch) return g.mongoEdit({ $pull: e });

	const embed: Eris.EmbedOptions = {
		title: "Role Created",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Name: ${role.name}`,
			`Mentionable: ${role.mentionable ? "Yes" : "No"}`,
			`Hoisted: ${role.hoist ? "Yes" : "No"}`,
			`Managed: ${role.managed ? "Yes" : "No"}`,
			`Position: ${role.position}`,
			`Color: ${role.color}`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.green
	};

	const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.ROLE_CREATE, role.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed }).catch(err => null);
}));
