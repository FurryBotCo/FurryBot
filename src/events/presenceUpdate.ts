import ClientEvent from "../util/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";

export default new ClientEvent("presenceUpdate", (async function (this: FurryBot, other: Eris.Member | Eris.Relationship, oldPresence?: Eris.OldPresence) {
	// @TODO we can do this later
	return;
	/*if (!this || !other || !oldPresence) return;
	this.increment([
		"events.presenceUpdate"
	]);
	if (other instanceof Eris.Member) {
		const g = await db.getGuild(other.guild.id);
		const e = g.logEvents.presenceUpdate;
		if (!e.enabled || !e.channel) return;
		const ch = await this.getRESTChannel(e.channel) as Eris.GuildTextableChannel;
		if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
			logEvents: {
				presenceUpdate: {
					enabled: false,
					channel: null
				}
			}
		});

		const props: { [k: string]: { type: string; name: string; } } = {
			"status": {
				type: "string",
				name: "Status"
			},
			"game.name": {
				type: "string",
				name: "Game Name"
			},
			"game.type": {
				type: "gameType",
				name: "Game Type"
			},
			"game.url": {
				type: "string",
				name: "Game URL"
			}
		};
		const changes: ("status" | "game.name" | "game.type" | "game.url")[] = [];

		if (other.status !== oldPresence.status) changes.push("status");
		if (other.game.name !== oldPresence.game.name) changes.push("game.name");
		if (other.game.type !== oldPresence.game.type) changes.push("game.type");
		if (other.game.url !== oldPresence.game.url) changes.push("game.url");

		if (changes.length === 0) return;

		const embed: Eris.EmbedOptions = {
			title: "Role Updated",
			author: {
				name: other.guild.name,
				icon_url: other.guild.iconURL
			},
			description: `User: ${other.username}#${other.discriminator} (<@!${other.id}>)`,
			timestamp: new Date().toISOString(),
			color: Colors.orange
		};

		if (other.status !== oldPresence.status) embed.description += `\nStatus: ${config.emojis[oldPresence.status]}**${oldPresence.status}** -> ${config.emojis[other.status]}**${other.status}**`;
		if (other.game.name !== oldPresence.game.name) embed.description += `\nGame Name: **${oldPresence.game.name}** -> **${other.game.name}**`;
		if (other.game.type !== oldPresence.game.type) embed.description += `\nGame Type: **${oldPresence.game.type}** -> **${other.game.type}**`;
		if (other.game.url !== oldPresence.game.url) embed.description += `\nGame URL: **${oldPresence.game.url}** -> **${other.game.url}**`;

		return ch.createMessage({ embed }).catch(err => null);
	}*/
}));
