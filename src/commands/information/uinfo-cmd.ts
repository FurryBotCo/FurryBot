import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import db from "../../db";
import KSoft from "../../util/req/KSoft";
import DRep from "../../util/req/DRep";
import { BotFunctions, Command, defaultEmojis, EmbedBuilder } from "core";
import { Time } from "utilities";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["uinfo", "userinfo", "ui"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let user: Eris.Member | Eris.User | null = msg.member;
		if (msg.args.length !== 0) {
			user = await msg.getMemberFromArgs();
			if (user === null) user = await msg.getUserFromArgs();

			if (user === null) return msg.channel.createMessage({
				embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
			});
		}

		if (user instanceof Eris.Member) {
			let flags: number = user.user.publicFlags ?? NaN;
			if (isNaN(flags)) {
				const v = await this.getUser(user.id);
				flags = v === null ? 0 : v.publicFlags ?? 0;
			}

			const m = Array.from(msg.channel.guild.members.values()).sort((a, b) => a.joinedAt - b.joinedAt).map(v => v.id);
			// eslint-disable-next-line no-inner-declarations
			function workItOut(n: boolean) {
				const k: Array<string> = [];
				for (let i = 1; i < 3; i++) {
					const d = n ? m.indexOf(user!.id) - i : m.indexOf(user!.id) + i;
					if (d < 0 || d > (m.length - 1)) continue;
					else k.push(m[d]);
				}
				return k;
			}
			const around = [...workItOut(true).reverse(), user.id, ...workItOut(false)];

			const c = await db.getUser(user.id);
			const badges = await c.getBadges(this);
			const cat: {
				[k in typeof badges[number]["category"]]: Array<typeof badges[number]>;
			} = {};
			badges.map(b => {
				if (!cat[b.category]) cat[b.category] = [];
				cat[b.category].push(b);
			});

			let check: boolean | null;
			try {
				check = await KSoft.bans.check(user.id);
			} catch (e) {
				check = null;
			}

			let rep: {
				upvotes: number;
				downvotes: number;
				rank: string;
				xp: number;
				staff: boolean;
				reputation: number;
			} | null;
			try {
				// eslint-disable-next-line
				rep = await DRep.rep(user.id);
			} catch (e) {
				rep = null;
			}

			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setImage(user.avatarURL)
					.setDescription([
						`**{lang:${cmd.lang}.mainInfo}**:`,
						`${defaultEmojis.dot} {lang:other.words.tag$ucwords$}: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
						`${defaultEmojis.dot} {lang:other.words.id$upper$}: ${user.id}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.joinDate}: ${Time.formatDateWithPadding(user.joinedAt, true)}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.creationDate}: ${Time.formatDateWithPadding(user.createdAt, true)}`,
						`${defaultEmojis.dot} {lang:other.words.roles$ucwords$} [${user.roles.length}]: ${user.roles.reduce((a, b) => a + msg.channel.guild.roles.get(b)!.name.length, 0) > 250 ? `{lang:${cmd.lang}.tooManyRoles|${msg.prefix}|${user.user.id}}` : user.roles.length === 0 ? "NONE" : user.roles.map(r => `<@&${r}>`).join(" ")}`,
						`${defaultEmojis.dot} {lang:other.words.status$ucwords$}: <:${config.emojis.status[user.status || "offline"]}> ${user.status || "offline"}`, /* if we get no status, assume offline */
						`${defaultEmojis.dot} {lang:other.words.game$ucwords$}: ${!user.game ? "{lang:other.words.none}" : `${user.game.name!}`}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.joinPos}: #${m.indexOf(user.id) + 1}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.nearbyJoins}:`,
						...around.map(a => a === msg.author.id ? `- [#${m.indexOf(a) + 1}] **<@!${a}>**` : `- [#${m.indexOf(a) + 1}] <@!${a}>`),
						"",
						`**{lang:${cmd.lang}.socialProfiles}:**`,
						...(c.id !== msg.author.id ? [] : [`[[{lang:other.words.add}](https://${config.web.api.host}/socials)] [[{lang:other.words.remove}](https://${config.web.api.host}/unlink)]`]),
						...((c.socials ?? []).length === 0 ? ["{lang:other.words.none}"] : c.socials.map(s => {
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
									return `<:${config.emojis.socials["discord.bio"]}> [dsc.bio/${s.slug}](https://dsc.bio/${s.slug})`;
									break;
								}
							}
						})),
						"",
						"**{lang:other.words.user$ucwords$} {lang:other.words.badges$ucwords$}:**",
						...Object.keys(cat).map(k => [
							`- {lang:other.badges.category.${k}}`,
							...(cat[k].map(v => `${v.emoji} **{lang:other.badges.names.${v.id}}**`) || [`${defaultEmojis.dot} {lang:other.words.none}`])
						].join("\n")),
						"",
						"**{lang:other.words.other$ucwords$}:**",
						`[{lang:${cmd.lang}.drep}](https://discordrep.com/u/${user.id}): ${rep === null ? "**{lang:other.words.unknown$ucwords}**" : `**${rep.reputation}** (**${rep.upvotes}** <:${config.emojis.custom.upvote}> / **${rep.downvotes}** <:${config.emojis.custom.downvote}>)`}`,
						`{lang:${cmd.lang}.ksoft}: **{lang:other.words.${check === null ? "unknown" : check ? "yes" : "no"}$ucwords$}**`
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.toJSON()
			});
		} else if (user instanceof Eris.User) {
			let flags: number = user.publicFlags ?? NaN;
			if (isNaN(flags)) {
				const v = await this.getUser(user.id);
				flags = v === null ? 0 : v.publicFlags ?? 0;
			}

			const c = await db.getUser(user.id);
			const badges = await c.getBadges(this);
			const cat: {
				[k in typeof badges[number]["category"]]: Array<typeof badges[number]>;
			} = {};
			badges.map(b => {
				if (!cat[b.category]) cat[b.category] = [];
				cat[b.category].push(b);
			});

			const check = await KSoft.bans.check(user.id);

			// eslint-disable-next-line
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
						`${defaultEmojis.dot} {lang:other.words.tag$ucwords$}: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
						`${defaultEmojis.dot} {lang:other.words.id$upper$}: ${user.id}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.creationDate}: ${Time.formatDateWithPadding(user.createdAt, true)}`,
						"",
						`**{lang:${cmd.lang}.socialProfiles}:**`,
						...(c.id !== msg.author.id ? [] : [`[[{lang:other.words.add}](https://${config.web.api.host}/socials)] [[{lang:other.words.remove}](https://${config.web.api.host}/unlink)]`]),
						...((c.socials ?? []).length === 0 ? ["{lang:other.words.none}"] : c.socials.map(s => {
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
									return `<:${config.emojis.socials["discord.bio"]}> [dsc.bio/${s.slug}](https://dsc.bio/${s.slug})`;
									break;
								}
							}
						})),
						"",
						"**{lang:other.words.user$ucwords$} {lang:other.words.badges$ucwords$}:**",
						...Object.keys(cat).map(k => [
							`- {lang:other.badges.category.${k}}`,
							...(cat[k].map(v => `${v.emoji} **{lang:other.badges.names.${v.id}}**`) || [`${defaultEmojis.dot} {lang:other.words.none}`])
						].join("\n")),
						"",
						"**{lang:other.words.other$ucwords$}:**",
						`[{lang:${cmd.lang}.drep}](https://discordrep.com/u/${user.id}): **${rep.reputation}** (**${rep.upvotes}** <:${config.emojis.custom.upvote}> / **${rep.downvotes}** <:${config.emojis.custom.downvote}>)`,
						`{lang:${cmd.lang}.ksoft}: **{lang:other.words.${check ? "yes" : "no"}$ucwords$}**`
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.toJSON()
			});
		} else throw new TypeError("user is not Member or User");
	});
