import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import config from "../../config";
import { Time, Internal } from "../../util/Functions";
import db from "../../modules/Database";

export default new Command({
	triggers: [
		"uinfo",
		"ui"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs(0, false, true, 0);

	if (!user) return msg.errorEmbed("INVALID_MEMBER");
	const u = await db.getUser(user.id);
	let flags: number = user.user.publicFlags;
	if (typeof flags !== "number") {
		const u = await this.bot.getRESTUser(user.id);
		flags = u.publicFlags;
	}

	const m = Array.from(msg.channel.guild.members.values()).sort((a, b) => a.joinedAt - b.joinedAt).map(m => m.id);
	function workItOut(n: boolean) {
		const k: string[] = [];
		for (let i = 1; i < 3; i++) {
			const d = n ? m.indexOf(user.id) - i : m.indexOf(user.id) + i;
			if (d < 0 || d > (m.length - 1)) continue;
			else k.push(m[d]);
		}
		return k;
	}
	const around = [...workItOut(true).reverse(), user.id, ...workItOut(false)];
	const f: number[] = [];

	// assuming Discord flags are max 20
	for (let i = 0; i < 20; i++) if ((flags & (1 << i)) !== 0) f.push(i);
	if (config.developers.includes(user.id)) f.push(config.flags.dev);
	if (config.contributors.includes(user.id)) f.push(config.flags.contrib);
	if (config.helpers.includes(user.id)) f.push(config.flags.helper);
	if (config.horny.includes(user.id)) f.push(config.flags.horny);
	// try { if (u.staff) f.push(config.flags.staff); } catch (e) { }
	try { if (u.booster) f.push(config.flags.booster); } catch (e) { }
	const c = await db.getUser(user.id);
	const p = await c.premiumCheck();
	const ubl = await uConfig.checkBlacklist();
	if (ubl.current.length > 0) f.push(config.flags.blacklisted);
	if (p.active) f.push(config.flags.donator);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.uinfo.title}")
			.setImage(user.avatarURL)
			.setDescription([
				"**{lang:commands.information.uinfo.mainInfo}**:",
				`\u25FD {lang:commands.information.uinfo.tag}: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
				`\u25FD {lang:commands.information.uinfo.id}: ${user.id}`,
				`\u25FD {lang:commands.information.uinfo.joinDate}: ${Time.formatDateWithPadding(user.joinedAt, true)}`,
				`\u25FD {lang:commands.information.uinfo.creationDate}: ${Time.formatDateWithPadding(user.createdAt, true)}`,
				`\u25FD {lang:commands.information.uinfo.roles} [${user.roles.length}]: ${user.roles.reduce((a, b) => a + msg.channel.guild.roles.get(b).name.length, 0) > 250 ? `{lang:commands.information.uinfo.tooManyRoles|${gConfig.settings.prefix}|${user.user.id}}` : user.roles.length === 0 ? "NONE" : user.roles.map(r => `<@&${r}>`).join(" ")}`,
				`\u25FD {lang:other.words.status}: ${config.emojis[user.status || "offline"]} ${user.status || "offline"}`, /* if we get no status, assume offline */
				`\u25FD {lang:other.words.game}: ${!user.game ? "{lang:other.words.none}" : `${user.game.name}`}`,
				`\u25FD {lang:commands.information.uinfo.joinPos}: #${m.indexOf(user.id) + 1}`,
				"\u25FD {lang:commands.information.uinfo.nearbyJoins}:",
				...around.map(a => a === msg.author.id ? `- [#${m.indexOf(a) + 1}] **<@!${a}>**` : `- [#${m.indexOf(a) + 1}] <@!${a}>`),
				"",
				"**{lang:commands.information.uinfo.socialProfiles}:**",
				...(c.id !== msg.author.id ? [] : [`[[{lang:other.words.add}](https://${config.web.api.host}/socials)] [[{lang:other.words.remove}](https://${config.web.api.host}/unlink)]`]),
				...(c.socials.length === 0 ? ["{lang:other.words.none}"] : c.socials.map(s => {
					switch (s.type) {
						case "twitter": {
							return `${config.emojis.twitter} [@${s.username}](https://twitter.com/intent/user?user_id=${s.id})`;
							break;
						}

						case "reddit": {
							return `${config.emojis.reddit} [u/${s.username}](https://reddit.com/user/${s.username})`;
							break;
						}

						case "discord.bio": {
							return `${config.emojis["discord.bio"]} [dsc.bio/${s.slug}](https://dsc.bio/${s.slug})`;
							break;
						}
					}
				})),
				"",
				"**{lang:commands.information.uinfo.badges}:**",
				...(f.length === 0 ? ["\u25FD {lang:other.words.none}"] : f.map(k => `{lang:other.userFlags.${k}}`))
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.toJSON()
	});
}));
