import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility, Time, Internal } from "../util/Functions";
import config from "../config";

export default new ClientEvent("guildMemberRemove", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member) {
	this.track("events", "guildMemberRemove");

	if (config.beta && !config.client.betaEventGuilds.includes(guild.id)) return;

	const g = await db.getGuild(guild.id);
	let e: typeof g["logEvents"][0];
	if (!(!g || !g.logEvents || !(g.logEvents instanceof Array))) e = g.logEvents.find(l => l.type === "memberLeave");
	(async () => {
		if (!(!e || !e.channel)) {
			if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
			const ch = guild.channels.get(e.channel) as Eris.GuildTextableChannel;
			if (!ch) return g.mongoEdit({ $pull: e });

			const embed: Eris.EmbedOptions = {
				title: "Member Left",
				author: {
					name: guild.name,
					icon_url: guild.iconURL
				},
				description: [
					`Member ${member.username}#${member.discriminator} (<@!${member.id}>) {REPLACE}.`,
					`Account Creation Date: ${Time.toReadableDate(member.createdAt).split(" ").slice(0, 2).join(" ").replace(/-/g, "/")}`
				].join("\n"),
				timestamp: new Date().toISOString(),
				color: Colors.red,
				thumbnail: {
					url: member.avatarURL
				}
			};

			const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MEMBER_KICK, member.id);
			if (log.success) {
				embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
				embed.title = "Member Kicked";
				embed.description = embed.description.replace("{REPLACE}", "was Kicked");
			} embed.description = embed.description.replace("{REPLACE}", "Left");

			await ch.createMessage({ embed }).catch(err => null);
		}
	})();


	if (g.settings.leaveEnabled) {
		if (!g.settings.leaveChannel || !guild.channels.has(g.settings.leaveChannel)) await g.edit({
			settings: {
				leaveEnabled: false,
				leaveChannel: null
			}
		}); else {
			const m = await (guild.channels.get(g.settings.leaveChannel) as Eris.GuildTextableChannel).createMessage({
				embed: {
					author: {
						name: `${member.username}#${member.discriminator}`,
						icon_url: member.avatarURL
					},
					title: "Member Left..",
					description: Internal.formatWelcome(g.settings.leaveMessage, member.user, guild),
					timestamp: new Date().toISOString(),
					footer: {
						text: `Joined This Server ${Time.formatAgo(member.joinedAt)} ago`
					},
					color: Colors.red
				}
			}).catch(err => g.edit({
				settings: {
					joinEnabled: false
				}
			}));


			if (g.settings.welcomeDeleteTime !== 0) setTimeout(() => m.delete().catch(err => null), g.settings.welcomeDeleteTime * 1e3);
		}
	}
}));
