import Command from "../../util/cmd/Command";
import Utility from "../../util/Functions/Utility";
import db from "../../util/Database";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import Time from "../../util/Functions/Time";
import KSoft from "../../util/req/KSoft";
import phin from "phin";
import DRep from "../../util/req/DRep";

export default new Command(["uinfo", "userinfo", "ui"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

		if (!user) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});
		const u = await db.getUser(user.id);
		let flags: number = user.user.publicFlags;
		if (typeof flags !== "number") {
			const u = await this.getUser(user.id);
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
		// if (config.contributors.includes(user.id)) f.push(config.flags.contrib);
		// if (config.helpers.includes(user.id)) f.push(config.flags.helper);
		// try { if (u.staff) f.push(config.flags.staff); } catch (e) { }
		try {
			if (u.booster) f.push(config.flags.booster);
		} catch (e) { }
		const c = await db.getUser(user.id);
		const p = await c.checkPremium();
		const ubl = await c.checkBlacklist();
		if (ubl.current.length > 0) f.push(config.flags.blacklisted);
		switch (user.id) {
			case "158750488563679232": f.push(config.flags.horny); break;
			case "280158289667555328": f.push(config.flags.horny, config.flags.sub, config.flags.cute); break;
		}
		if (p.active) f.push(config.flags.donator);

		const check = await KSoft.bans.check(user.id);

		const rep = await DRep.rep(user.id) as {
			upvotes: number;
			downvotes: number;
			rank: string;
			xp: number;
			staff: boolean;
			reputation: number;
		};

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setImage(user.avatarURL)
				.setDescription([
					`**{lang:${cmd.lang}.mainInfo}**:`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.tag}: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.id}: ${user.id}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.joinDate}: ${Time.formatDateWithPadding(user.joinedAt, true)}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.creationDate}: ${Time.formatDateWithPadding(user.createdAt, true)}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.roles} [${user.roles.length}]: ${user.roles.reduce((a, b) => a + msg.channel.guild.roles.get(b).name.length, 0) > 250 ? `{lang:${cmd.lang}.tooManyRoles|${msg.gConfig.settings.prefix}|${user.user.id}}` : user.roles.length === 0 ? "NONE" : user.roles.map(r => `<@&${r}>`).join(" ")}`,
					`${config.emojis.default.dot} {lang:other.words.status$ucwords$}: <:${config.emojis.status[user.status || "offline"]}> ${user.status || "offline"}`, /* if we get no status, assume offline */
					`${config.emojis.default.dot} {lang:other.words.game$ucwords$}: ${!user.game ? "{lang:other.words.none}" : `${user.game.name}`}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.joinPos}: #${m.indexOf(user.id) + 1}`,
					`${config.emojis.default.dot} {lang:${cmd.lang}.nearbyJoins}:`,
					...around.map(a => a === msg.author.id ? `- [#${m.indexOf(a) + 1}] **<@!${a}>**` : `- [#${m.indexOf(a) + 1}] <@!${a}>`),
					"",
					`**{lang:${cmd.lang}.socialProfiles}:**`,
					...(c.id !== msg.author.id ? [] : [`[[{lang:other.words.add}](https://${config.web.api.host}/socials)] [[{lang:other.words.remove}](https://${config.web.api.host}/unlink)]`]),
					...(c.socials.length === 0 ? ["{lang:other.words.none}"] : c.socials.map(s => {
						switch (s.type) {
							case "twitter": {
								return `<:${config.emojis.socials.twitter}> [@${s.username}](https://twitter.com/intent/user?user_id=${s.id})`;
								break;
							}

							case "reddit": {
								return `<:${config.emojis.socials.reddit}> [u/${s.username}](https://reddit.com/user/${s.username})`;
								break;
							}

							case "discord.bio": {
								return `<:${config.emojis["discord.bio"]}> [dsc.bio/${s.slug}](https://dsc.bio/${s.slug})`;
								break;
							}
						}
					})),
					"",
					`**{lang:${cmd.lang}.badges}:**`,
					...(f.length === 0 ? [`${config.emojis.default.dot} {lang:other.words.none}`] : f.map(k => `{lang:other.userFlags.${k}}`)),
					"",
					`{lang:${cmd.lang}.statusNote}`
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});
	});
