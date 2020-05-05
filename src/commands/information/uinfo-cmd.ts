import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time } from "../../util/Functions";
import config from "../../config";
import db, { mdb } from "../../modules/Database";
import { Blacklist } from "../../util/@types/Misc";
import { unlink } from "fs";

export default new Command({
	triggers: [
		"uinfo",
		"userinfo",
		"ui"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");
	let flags: number = user.user.publicFlags;
	if (typeof flags !== "number") {
		const u = await this.getRESTUser(user.id);
		flags = u.publicFlags;
	}

	const m = Array.from(msg.channel.guild.members.values()).sort((a, b) => a.joinedAt - b.joinedAt).map(m => m.id);

	const around = [...workItOut(true).reverse(), user.id, ...workItOut(false)];

	function workItOut(n: boolean) {
		const k: string[] = [];
		for (let i = 1; i < 3; i++) {
			const d = n ? m.indexOf(user.id) - i : m.indexOf(user.id) + i;
			if (d < 0 || d > (m.length - 1)) continue;
			else k.push(m[d]);
		}
		return k;
	}
	const f: number[] = [];

	// assuming Discord flags are max 20
	for (let i = 0; i < 20; i++) if ((flags & (1 << i)) !== 0) f.push(i);
	if (config.developers.includes(user.id)) f.push(config.flags.dev);
	if (config.contributors.includes(user.id)) f.push(config.flags.contrib);
	if (config.helpers.includes(user.id)) f.push(config.flags.helper);
	try { if (this.guilds.get(config.bot.mainGuild).members.get(user.id).roles.includes(config.roles.staff) || user.id === this.guilds.get(config.bot.mainGuild).ownerID) f.push(config.flags.staff); } catch (e) { }
	try { if (this.guilds.get(config.bot.mainGuild).members.get(user.id).roles.includes(config.roles.booster)) f.push(config.flags.booster); } catch (e) { }
	const c = await db.getUser(user.id);
	const p = await c.premiumCheck();
	const ublB: Blacklist.UserEntry[] = await mdb.collection("blacklist").find({ userId: user.id }).toArray();
	const ubl: Blacklist.UserEntry[] = ublB.filter(r => [0, null].includes(r.expire) || r.expire > Date.now());
	if (ubl.length > 0) f.push(config.flags.blacklisted);
	if (p.active) f.push(config.flags.donator);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.information.uinfo.title}`)
			.setImage(user.avatarURL)
			.setDescription([
				"**{lang:commands.information.uinfo.mainInfo}**:",
				`\u25FD {lang:commands.information.uinfo.tag}: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
				`\u25FD {lang:commands.information.uinfo.id}: ${user.id}`,
				`\u25FD {lang:commands.information.uinfo.joinDate}: ${Time.formatDateWithPadding(user.joinedAt, true)}`,
				`\u25FD {lang:commands.information.uinfo.creationDate}: ${Time.formatDateWithPadding(user.createdAt, true)}`,
				`\u25FD {lang:commands.information.uinfo.roles} [${user.roles.length}]: ${user.roles.reduce((a, b) => a + msg.channel.guild.roles.get(b).name.length, 0) > 250 ? `{lang:commands.information.uinfo.tooManyRoles|${gConfig.settings.prefix}|${user.user.id}}` : user.roles.length === 0 ? "NONE" : user.roles.map(r => `<@&${r}>`).join(" ")}`,
				`\u25FD {lang:commands.information.uinfo.joinPos}: #${m.indexOf(user.id) + 1}`,
				"\u25FD {lang:commands.information.uinfo.nearbyJoins}:",
				...around.map(a => a === msg.author.id ? `- [#${m.indexOf(a) + 1}] **<@!${a}>**` : `- [#${m.indexOf(a) + 1}] <@!${a}>`),
				"",
				"**{lang:commands.information.uinfo.badges}:**",
				...(f.length === 0 ? ["\u25FD {lang:other.none}"] : f.map(k => `{lang:other.userFlags.${k}}`))
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
	});
}));
