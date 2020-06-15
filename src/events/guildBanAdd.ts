import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility } from "../util/Functions";
import config from "../config";

export default new ClientEvent("guildBanAdd", (async function (this: FurryBot, guild: Eris.Guild, user: Eris.User) {
	this.track("events", "guildBanAdd");

	if (config.beta && !config.client.betaEventGuilds.includes(guild.id)) return;

	const g = await db.getGuild(guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "memberBan");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);
	if (!ch) return g.mongoEdit({ $pull: e });

	const embed: Eris.EmbedOptions = {
		title: "Member Banned",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member ${user.username}#${user.discriminator} (<@!${user.id}>) was banned.`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.red
	};

	const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MEMBER_BAN_ADD, user.id);
	if (log.success === false) {
		embed.description += `\n${log.error.text} (${log.error.code})`;
	} else if (log.success) {
		embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason || "None Provided."}`;
	}

	await ch.createMessage({ embed }).catch(err => null);

	/*if (g.settings.modlog && guild.channels.has(g.settings.modlog)) {
		const ml = guild.channels.get<Eris.GuildTextableChannel>(g.settings.modlog);
		const ms = ml.messages.get(ml.lastMessageID);
		if (ms && ms.embeds.length > 0 && ms.embeds.find(e => e.description.indexOf(user.id) !== -1)) return console.log("a");
		await this.m.get(g.settings.modlog).create({
			target: user.id,
			blame: blame ? blame.id : null,
			reason,
			color: Colors.red,
			time: 0,
			actionName: "Member Banned",
			extra: "",
			timestamp: Date.now()
		});
	}*/
}));
