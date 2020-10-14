import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Time from "../../util/Functions/Time";

export default new ClientEvent("guildMemberAdd", async function (guild, member) {
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "memberJoin");
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const b = [];
		if (member.user.publicFlags & Eris.Constants.UserFlags.DISCORD_EMPLOYEE) b.push(`<:${config.emojis.badges.DiscordStaff}> {lang:other.badges.DiscordStaff}`);
		if (member.user.bot /* this is some padding to make the lines similar */) b.push(`<:${config.emojis.badges.Bot}> {lang:other.badges.Bot}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.VERIFIED_BOT) b.push(`<:${config.emojis.badges.VerifiedBot}> {lang:other.badges.VerifiedBot}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.VERIFIED_BOT_DEVELOPER) b.push(`<:${config.emojis.badges.VerifiedDev}> {lang:other.badges.VerifiedDev}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.DISCORD_PARTNER) b.push(`<:${config.emojis.badges.DiscordPartner}> {lang:other.badges.DiscordPartner}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.HYPESQUAD_EVENTS) b.push(`<:${config.emojis.badges.HypesquadEvents}> {lang:other.badges.HypesquadEvents}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.HOUSE_BRAVERY) b.push(`<:${config.emojis.badges.HypesquadBravery}> {lang:other.badges.HypesquadBravery}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.HOUSE_BALANCE) b.push(`<:${config.emojis.badges.HypesquadBalance}> {lang:other.badges.HypesquadBalance}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.HOUSE_BRILLIANCE) b.push(`<:${config.emojis.badges.HypesquadBrilliance}> {lang:other.badges.HypesquadBrilliance}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.EARLY_SUPPORTER) b.push(`<:${config.emojis.badges.EarlySupporter}> {lang:other.badges.EarlySupporter}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.BUG_HUNTER_LEVEL_1) b.push(`<:${config.emojis.badges.BugHunter}> {lang:other.badges.BugHunter}`);
		if (member.user.publicFlags & Eris.Constants.UserFlags.BUG_HUNTER_LEVEL_2) b.push(`<:${config.emojis.badges.BugHunter2}> {lang:other.badges.BugHunter2}`);

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.memberJoin.title}")
			.setThumbnail(member.user.avatarURL)
			.setDescription([
				`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`,
				`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`,
				"",
				...b
			].join("\n"))
			.setFooter(`{lang:other.events.memberJoin.footer|${guild.memberCount}|${Time.formatAgo(member.user.createdAt, true, true).split(",")[0]}$ucwords$}`);

		await ch.createMessage({ embed: e.toJSON() });
	}
});
