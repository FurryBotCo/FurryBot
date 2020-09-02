import Command from "../../../util/cmd/Command";
import config from "../../../config";
import Eris from "eris";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Time from "../../../util/Functions/Time";
import Language from "../../../util/Language";

export default new Command(["sinfo", "serverinfo", "si"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const o: Eris.User = await this.bot.getRESTUser(msg.channel.guild.ownerID).catch(err => null);
		const owner = !o ? `{lang:other.words.unknown$ucwords$} (${msg.channel.guild.ownerID})` : `${o.username}#${o.discriminator} (${o.id})`;

		const fDocsUrl = "https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features";
		const fStr = {
			INVITE_SPLASH: `[{lang:${cmd.lang}.features.inviteSplash}](${fDocsUrl} '{lang:${cmd.lang}.features.inviteSplashDesc}')`,
			VIP_REGIONS: `[{lang:${cmd.lang}.features.vipRegions}](${fDocsUrl} '{lang:${cmd.lang}.features.vipRegionsDesc}')`,
			VANITY_URL: `[{lang:${cmd.lang}.features.vanityUrl}](${fDocsUrl} '{lang:${cmd.lang}.features.vanityUrlDesc}')`,
			VERIFIED: `[{lang:${cmd.lang}.features.verified}](${fDocsUrl} '{lang:${cmd.lang}.features.verifiedDesc}')`,
			PARTNERED: `[{lang:${cmd.lang}.features.partnered}](${fDocsUrl} '{lang:${cmd.lang}.features.partneredDesc}')`,
			PUBLIC: `[{lang:${cmd.lang}.features.public}](${fDocsUrl} '{lang:${cmd.lang}.features.publicDesc}')`,
			COMMERCE: `[{lang:${cmd.lang}.features.commerce}](${fDocsUrl} '{lang:${cmd.lang}.features.commerceDesc}')`,
			NEWS: `[{lang:${cmd.lang}.features.news}](${fDocsUrl} '{lang:${cmd.lang}.features.newsDesc}')`,
			DISCOVERABLE: `[{lang:${cmd.lang}.features.discoverable}](${fDocsUrl} '{lang:${cmd.lang}.features.discoverableDesc}')`,
			FEATURABLE: `[{lang:${cmd.lang}.features.featurable}](${fDocsUrl} '{lang:${cmd.lang}.features.featurableDesc}')`,
			ANIMATED_ICON: `[{lang:${cmd.lang}.features.animatedIcon}](${fDocsUrl} '{lang:${cmd.lang}.features.animatedIconDesc}')`,
			BANNER: `[{lang:${cmd.lang}.features.banner}](${fDocsUrl} '{lang:${cmd.lang}.features.bannerDesc}')`,
			WELCOME_SCREEN_ENABLED: `[{lang:${cmd.lang}.features.welcomeScreen}](${fDocsUrl} '{lang:${cmd.lang}.features.welcomeScreenDesc}')`,
			PUBLIC_DISABLED: `[{lang:${cmd.lang}.features.publicDisabled}](${fDocsUrl} '{lang:${cmd.lang}.features.publicDisabledDesc}')`,
			MORE_EMOJI: `[{lang:${cmd.lang}.features.moreEmoji}](${fDocsUrl} '{lang:${cmd.lang}.features.moreEmojiDesc}')`,
			COMMUNITY: `[{lang:${cmd.lang}.features.community}](${fDocsUrl} '{lang:${cmd.lang}.features.communityDesc}')`
		};

		let features = msg.channel.guild.features.map(f => `${config.emojis.default.dot} ${fStr[f] || `${f}`}`).join("\n");
		if (features === "") features = `${config.emojis.default.dot} NONE`;

		const verificationLevel = [
			`[{lang:${cmd.lang}.verification.none}](https://furry.bot '{lang:${cmd.lang}.verification.noneDesc}')`,
			`[{lang:${cmd.lang}.verification.low}](https://furry.bot '{lang:${cmd.lang}.verification.lowDesc}')`,
			`[{lang:${cmd.lang}.verification.medium}](https://furry.bot '{lang:${cmd.lang}.verification.mediumDesc}')`,
			`[{lang:${cmd.lang}.verification.high}](https://furry.bot '{lang:${cmd.lang}.verification.highDesk}')`,
			`[{lang:${cmd.lang}.verification.veryHigh}](https://furry.bot '{lang:${cmd.lang}.verification.veryHighDesc}')`
		];
		// let s;
		// if (msg.channel.guild.memberCount < 1000) s = await Promise.all(msg.guild.members.filter(m => !m.user.bot).map((m) => mdb.collection("users").findOne({ id: m.id }))).then(res => res.map(m => m === null ? config.defaults.userConfig : m).map(m => ({ owoCount: m.owoCount === undefined ? 0 : m.owoCount, uwuCount: m.uwuCount === undefined ? 0 : m.uwuCount })));
		// else s = false;
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
			.setColor(Math.floor(Math.random() * 0xFFFFFF));

		if (msg.args.length === 0) embed.setDescription([
			`**{lang:${cmd.lang}.server}**: \`${msg.prefix}sinfo server\``,
			`**{lang:${cmd.lang}.members}**: \`${msg.prefix}sinfo members\``,
			`**{lang:${cmd.lang}.channels}**: \`${msg.prefix}sinfo channels\``,
			`**{lang:${cmd.lang}.icon}**: \`${msg.prefix}sinfo icon\``,
			`**{lang:${cmd.lang}.banner}**: \`${msg.prefix}sinfo banner\``,
			`**{lang:${cmd.lang}.splash}**: \`${msg.prefix}sinfo splash\``
		].join("\n"));
		else {
			switch (msg.args[0].toLowerCase()) {
				case "server": {
					embed
						.setDescription([
							`**{lang:${cmd.lang}.server}**:`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.name}: **${msg.channel.guild.name}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.id}: **${msg.channel.guild.id}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.owner}:** ${owner}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.region}: **${msg.channel.guild.region}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.creationDate}: **${Time.formatDateWithPadding(msg.channel.guild.createdAt, true)}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.nitroBoosts}: **${msg.channel.guild.premiumSubscriptionCount || "None"}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.boostTier}: **${msg.channel.guild.premiumTier || "None"}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.large}: **{lang:${cmd.lang}.${msg.channel.guild.large ? "yes" : "no"}}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.verificationLevel}: **${verificationLevel[msg.channel.guild.verificationLevel]}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.2faRequirement}: **${mfaLevel[msg.channel.guild.mfaLevel]}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.defaultNotificationsLabel}: **${defaultNotifications[msg.channel.guild.defaultNotifications]}**`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.vanityUrl}: **${msg.channel.guild.features.includes("VANITY_URL") ? `[https://discord.gg/${msg.channel.guild.vanityURL}](https://discord.gg/${msg.channel.guild.vanityURL})` : "None"}**`,
							"",
							`**[{lang:${cmd.lang}.featuresLabel}](${fDocsUrl})**:`,
							features
						].join("\n"))
						.setThumbnail(msg.channel.guild.iconURL);
					break;
				}
				case "members": {
					embed
						.setDescription([
							`**{lang:${cmd.lang}.members}**:`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.total}: ${msg.channel.guild.memberCount} ([{lang:${cmd.lang}.note}](https://botapi.furry.bot/note/sinfo '{lang:${cmd.lang}.noteContent}'))`,
							`${config.emojis.default.dot} ${config.emojis.status.online}: ${msg.channel.guild.members.filter(m => m.status === "online").length}`,
							`${config.emojis.default.dot} ${config.emojis.status.idle}: ${msg.channel.guild.members.filter(m => m.status === "idle").length}`,
							`${config.emojis.default.dot} ${config.emojis.status.dnd}: ${msg.channel.guild.members.filter(m => m.status === "dnd").length}`,
							`${config.emojis.default.dot} ${config.emojis.status.offline}: ${msg.channel.guild.members.filter(m => m.status === "offline").length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.nonBots}: ${msg.channel.guild.members.filter(m => !m.bot).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.bots}: ${msg.channel.guild.members.filter(m => m.bot).length}`
						].join("\n"))
						.setThumbnail(msg.channel.guild.iconURL);
					break;
				}

				case "channels": {
					embed
						.setDescription([
							`**{lang:${cmd.lang}.channels}**:`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.total}: ${msg.channel.guild.channels.size}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.text}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.voice}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_VOICE).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.category}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.news}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_NEWS).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.store}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_STORE).length}`,
							"",
							`${config.emojis.default.dot} {lang:${cmd.lang}.hiddenYou}: ${msg.channel.guild.channels.filter(c => !c.permissionsOf(msg.author.id).has("readMessages")).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.visibleYou}: ${msg.channel.guild.channels.filter(c => c.permissionsOf(msg.author.id).has("readMessages")).length}`,
							"",
							`${config.emojis.default.dot} {lang:${cmd.lang}.hiddenMe}: ${msg.channel.guild.channels.filter(c => !c.permissionsOf(this.bot.user.id).has("readMessages")).length}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.visibleMe}: ${msg.channel.guild.channels.filter(c => c.permissionsOf(this.bot.user.id).has("readMessages")).length}`
						].join("\n"))
						.setThumbnail(msg.channel.guild.iconURL);
					break;

				}

				case "icon": {
					embed
						.setImage(msg.channel.guild.iconURL)
						.setDescription([
							`**{lang:${cmd.lang}.icon}**:`,
							`${[128, 256, 1024, 2048, 4096].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.iconURL.split("?")[0]}?size=${sz})`).join("  ")}`
						].join("\n"));
					break;
				}

				case "splash": {
					if (!msg.channel.guild.splashURL) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSplash`));
					embed
						.setImage(msg.channel.guild.splashURL)
						.setDescription([
							`**{lang:${cmd.lang}.splash}**:`,
							`${[128, 256, 1024, 2048, 4096].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.splashURL.split("?")[0]}?size=${sz})`).join("  ")}`
						].join("\n"));
					break;
				}

				case "banner": {
					if (!msg.channel.guild.bannerURL) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBanner`));
					embed
						.setImage(msg.channel.guild.bannerURL)
						.setDescription([
							`**{lang:${cmd.lang}.banner}**:`,
							`${[128, 256, 1024, 2048, 4096].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.bannerURL.split("?")[0]}?size=${sz})`).join("  ")}`
						].join("\n"));
					break;
				}

				default: {
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidType`));
				}
			}
		}
		return msg.channel.createMessage({
			embed: embed.toJSON()
		});
	});
