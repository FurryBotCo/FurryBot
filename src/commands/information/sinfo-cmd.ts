import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Colors, Command, defaultEmojis, EmbedBuilder } from "core";
import Language from "language";
import Eris from "eris";
import { Time } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["sinfo", "serverinfo", "si"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const o: Eris.User | null = await this.getUser(msg.channel.guild.ownerID).catch(() => null);
		const owner = o === null ? `{lang:other.words.unknown$ucwords$} (${msg.channel.guild.ownerID})` : `${o.username}#${o.discriminator} (${o.id})`;

		const features = msg.channel.guild.features.length === 0 ? `${defaultEmojis.dot} NONE` :  msg.channel.guild.features.map(f => `${defaultEmojis.dot} ${Language.exists(msg.gConfig.settings.lang, [`other.serverFeatures.${f}.name`, `other.serverFeatures.${f}.description`]) ? `[{lang:other.serverFeatures.${f}.name}](https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features '{lang:other.serverFeatures.${f}.description}')` : f}`).join("\n");

		const verificationLevel = [
			`[{lang:${cmd.lang}.verification.none}](https://furry.bot '{lang:${cmd.lang}.verification.noneDesc}')`,
			`[{lang:${cmd.lang}.verification.low}](https://furry.bot '{lang:${cmd.lang}.verification.lowDesc}')`,
			`[{lang:${cmd.lang}.verification.medium}](https://furry.bot '{lang:${cmd.lang}.verification.mediumDesc}')`,
			`[{lang:${cmd.lang}.verification.high}](https://furry.bot '{lang:${cmd.lang}.verification.highDesk}')`,
			`[{lang:${cmd.lang}.verification.veryHigh}](https://furry.bot '{lang:${cmd.lang}.verification.veryHighDesc}')`
		];

		const mfaLevel = [
			`{lang:${cmd.lang}.mfa.notEnabled}`,
			`{lang:${cmd.lang}.mfa.enabled}`
		];

		const defaultNotifications = [
			`{lang:${cmd.lang}.defaultNotifications.allMessages}`,
			`{lang:${cmd.lang}.defaultNotifications.onlyMentions}`
		];

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTitle(`{lang:${cmd.lang}.title} - **${msg.channel.guild.name}**`)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.furry);

		const sect = msg.args.length === 0 ? null : msg.args[0].toLowerCase();
		switch (sect ?? "server") {
			case "server": {
				embed
					.setDescription([
						"**{lang:other.words.server$ucwords$}**:",
						`${defaultEmojis.dot} {lang:other.words.name$ucwords$}: **${msg.channel.guild.name}**`,
						`${defaultEmojis.dot} {lang:other.words.id$upper$}: **${msg.channel.guild.id}**`,
						`${defaultEmojis.dot} {lang:other.words.owner$ucwords$}:** ${owner}**`,
						`${defaultEmojis.dot} {lang:other.words.region$ucwords$}: **${msg.channel.guild.region}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.creationDate}: **${Time.formatDateWithPadding(msg.channel.guild.createdAt, true)}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.nitroBoosts}: **${msg.channel.guild.premiumSubscriptionCount || "{lang:other.words.none$ucwrods$}"}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.boostTier}: **${msg.channel.guild.premiumTier || "{lang:other.words.none$ucwrods$}"}**`,
						`${defaultEmojis.dot} {lang:other.words.large$ucwords$}: **{lang:other.words.${msg.channel.guild.large ? "yes" : "no"}$ucwords$}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.verificationLevel}: **${verificationLevel[msg.channel.guild.verificationLevel]}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.2faRequirement}: **${mfaLevel[msg.channel.guild.mfaLevel]}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.defaultNotificationsLabel}: **${defaultNotifications[msg.channel.guild.defaultNotifications]}**`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.vanityUrl}: **${msg.channel.guild.features.includes("VANITY_URL") ? `[https://discord.gg/${msg.channel.guild.vanityURL!}](https://discord.gg/${msg.channel.guild.vanityURL!})` : "None"}**`,
						"",
						"**[{lang:other.words.features$ucwords$}](https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features)**:",
						features,
						...(sect === null ? [
							"",
							`{lang:${cmd.lang}.helpNotice|${msg.prefix}}`
						] : [])
					].join("\n"))
					.setThumbnail(msg.channel.guild.iconURL!);
				break;
			}
			case "members": {
				embed
					.setDescription([
						"**{lang:other.words.members$ucwords$}**:",
						`${defaultEmojis.dot} {lang:other.words.total$ucwords$}: ${msg.channel.guild.memberCount} ([{lang:other.words.note$ucwords$}](https://botapi.furry.bot/note/sinfo '{lang:${cmd.lang}.noteContent}'))`,
						`${defaultEmojis.dot} <:${config.emojis.status.online}>: ${msg.channel.guild.members.filter(m => m.status === "online").length}`,
						`${defaultEmojis.dot} <:${config.emojis.status.idle}>: ${msg.channel.guild.members.filter(m => m.status === "idle").length}`,
						`${defaultEmojis.dot} <:${config.emojis.status.dnd}>: ${msg.channel.guild.members.filter(m => m.status === "dnd").length}`,
						`${defaultEmojis.dot} <:${config.emojis.status.offline}>: ${msg.channel.guild.members.filter(m => m.status === "offline").length}`,
						`${defaultEmojis.dot} {lang:other.words.nonBots$ucwords$}: ${msg.channel.guild.members.filter(m => !m.bot).length}`,
						`${defaultEmojis.dot} {lang:other.words.bots$ucwords$}: ${msg.channel.guild.members.filter(m => m.bot).length}`
					].join("\n"))
					.setThumbnail(msg.channel.guild.iconURL!);
				break;
			}

			case "channels": {
				embed
					.setDescription([
						"**{lang:other.words.channels$ucwords$}**:",
						`${defaultEmojis.dot} {lang:other.words.total$ucwords$}: ${msg.channel.guild.channels.size}`,
						`${defaultEmojis.dot} {lang:other.words.text$ucwords$}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT).length}`,
						`${defaultEmojis.dot} {lang:other.words.voice$ucwords$}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_VOICE).length}`,
						`${defaultEmojis.dot} {lang:other.words.category$ucwords$}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY).length}`,
						`${defaultEmojis.dot} {lang:other.words.news$ucwords$}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_NEWS).length}`,
						`${defaultEmojis.dot} {lang:other.words.store$ucwords$}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_STORE).length}`,
						"",
						`${defaultEmojis.dot} {lang:${cmd.lang}.hiddenYou}: ${msg.channel.guild.channels.filter(c => !c.permissionsOf(msg.author.id).has("readMessages")).length}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.visibleYou}: ${msg.channel.guild.channels.filter(c => c.permissionsOf(msg.author.id).has("readMessages")).length}`,
						"",
						`${defaultEmojis.dot} {lang:${cmd.lang}.hiddenMe}: ${msg.channel.guild.channels.filter(c => !c.permissionsOf(this.bot.user.id).has("readMessages")).length}`,
						`${defaultEmojis.dot} {lang:${cmd.lang}.visibleMe}: ${msg.channel.guild.channels.filter(c => c.permissionsOf(this.bot.user.id).has("readMessages")).length}`
					].join("\n"))
					.setThumbnail(msg.channel.guild.iconURL!);
				break;

			}

			case "icon": {
				embed
					.setImage(msg.channel.guild.iconURL!)
					.setDescription([
						"**{lang:other.words.icon$ucwords$}**:",
						`${[128, 256, 1024, 2048, 4096].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.iconURL!.split("?")[0]}?size=${sz})`).join("  ")}`
					].join("\n"));
				break;
			}

			case "splash": {
				if (msg.channel.guild.splashURL === null) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSplash`));
				embed
					.setImage(msg.channel.guild.splashURL)
					.setDescription([
						"**{lang:other.words.inviteSplash$ucwords$}**:",
						`${[128, 256, 1024, 2048, 4096].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.splashURL!.split("?")[0]}?size=${sz})`).join("  ")}`
					].join("\n"));
				break;
			}

			case "banner": {
				if (msg.channel.guild.bannerURL === null) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanner`));
				embed
					.setImage(msg.channel.guild.bannerURL)
					.setDescription([
						"**{lang:other.words.server$ucwords$} {lang:other.words.banner$ucwords$}**:",
						`${[128, 256, 1024, 2048, 4096].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.bannerURL!.split("?")[0]}?size=${sz})`).join("  ")}`
					].join("\n"));
				break;
			}

			case "help": {
				embed.setDescription([
					`**{lang:other.words.server$ucwords$}**: \`${msg.prefix}sinfo server\``,
					`**{lang:other.words.members$ucwords$}**: \`${msg.prefix}sinfo members\``,
					`**{lang:other.words.channels$ucwords$}**: \`${msg.prefix}sinfo channels\``,
					`**{lang:other.words.server$ucwords$} {lang:other.words.icon$ucwords$}**: \`${msg.prefix}sinfo icon\``,
					`**{lang:other.words.server$ucwords$} {lang:other.words.banner$ucwords$}**: \`${msg.prefix}sinfo banner\``,
					`**{lang:other.words.inviteSplash$ucwords$}**: \`${msg.prefix}sinfo splash\``,
					`**{lang:other.words.help$ucwords$}**: \`${msg.prefix}sinfo help\``
				].join("\n"));
				break;
			}

			default: {
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidType`));
			}
		}
		return msg.channel.createMessage({
			embed: embed.toJSON()
		});
	});
