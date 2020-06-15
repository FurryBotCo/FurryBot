import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility } from "../util/Functions";
import config from "../config";

export default new ClientEvent("guildBanRemove", (async function (this: FurryBot, guild: Eris.Guild, user: Eris.User) {
	this.track("events", "guildBanRemove");

	if (config.beta && !config.client.betaEventGuilds.includes(guild.id)) return;

	const g = await db.getGuild(guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "memberUnban");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);
	if (!ch) return g.mongoEdit({ $pull: e });

	const embed: Eris.EmbedOptions = {
		title: "Member Unbanned",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member ${user.username}#${user.discriminator} (<@!${user.id}>) was unbanned.`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.green
	};

	const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MEMBER_BAN_REMOVE, user.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed }).catch(err => null);
}));
