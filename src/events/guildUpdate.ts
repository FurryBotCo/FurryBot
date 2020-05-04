import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility, Time } from "../util/Functions";

export default new ClientEvent("guildUpdate", (async function (this: FurryBot, guild: Eris.Guild, oldGuild) {
	this.track("events", "guildUpdate");

	const g = await db.getGuild(guild.id);
	const e = g.logEvents.guildUpdate;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);

	const props: { [k: string]: { type: string; name: string; } } = {
		name: {
			type: "string",
			name: "Name"
		}
	};
	const changes: ("name")[] = [];

	if (guild.name !== oldGuild.name) changes.push("name");
	if (changes.length === 0) return;

	const embed: Eris.EmbedOptions = {
		title: "Server Updated",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			...(await Promise.all(changes.map(async (c) => {
				const ch = props[c];
				switch (ch.type) {
					case "boolean":
						return `${ch.name}: **${oldGuild[c] ? "Yes" : "No"}** -> **${guild[c] ? "Yes" : "No"}**`;
						break;

					case "string":
						return `${ch.name}: **${oldGuild[c] || "None"}** -> **${guild[c] || "None"}**`;
						break;

					case "number":
						return `${ch.name}: **${oldGuild[c] || 0}** -> **${guild[c] || 0}**`;
						break;

					case "time":
						return `${ch.name}: **${Time.ms((oldGuild[c] || 0 as any) * 1000, true)}** -> **${Time.ms((guild[c] || 0 as any) * 1000, true)}**`;
						break;
				}
			})))
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.orange
	};

	const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.GUILD_UPDATE, guild.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed }).catch(err => null);
}));
