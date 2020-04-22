import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Eris from "eris";
import { Time } from "../../util/Functions";
import config from "../../config";

export default new Command({
	triggers: [
		"sinfo",
		"serverinfo",
		"si"
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
	const o: Eris.User = await this.getRESTUser(msg.channel.guild.ownerID).catch(err => null);
	const owner = !o ? `Unknown ${msg.channel.guild.ownerID}` : `${o.username}#${o.discriminator} (${o.id})`;

	const fDocsUrl = "https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features";
	const fStr = {
		INVITE_SPLASH: `[{lang:commands.information.sinfo.features.inviteSplash}](${fDocsUrl} '{lang:commands.information.sinfo.features.inviteSplashDesc}')`,
		VIP_REGIONS: `[{lang:commands.information.sinfo.features.vipRegions}](${fDocsUrl} '{lang:commands.information.sinfo.features.vipRegionsDesc}')`,
		VANITY_URL: `[{lang:commands.information.sinfo.features.vanityUrl}](${fDocsUrl} '{lang:commands.information.sinfo.features.vanityUrlDesc}')`,
		VERIFIED: `[{lang:commands.information.sinfo.features.verified}](${fDocsUrl} '{lang:commands.information.sinfo.features.verifiedDesc}')`,
		PARTNERED: `[{lang:commands.information.sinfo.features.partnered}](${fDocsUrl} '{lang:commands.information.sinfo.features.partneredDesc}')`,
		PUBLIC: `[{lang:commands.information.sinfo.features.public}](${fDocsUrl} '{lang:commands.information.sinfo.features.publicDesc}')`,
		COMMERCE: `[{lang:commands.information.sinfo.features.commerce}](${fDocsUrl} '{lang:commands.information.sinfo.features.commerceDesc}')`,
		NEWS: `[{lang:commands.information.sinfo.features.news}](${fDocsUrl} '{lang:commands.information.sinfo.features.newsDesc}')`,
		DISCOVERABLE: `[{lang:commands.information.sinfo.features.discoverable}](${fDocsUrl} '{lang:commands.information.sinfo.features.discoverableDesc}')`,
		FEATURABLE: `[{lang:commands.information.sinfo.features.featurable}](${fDocsUrl} '{lang:commands.information.sinfo.features.featurableDesc}')`,
		ANIMATED_ICON: `[{lang:commands.information.sinfo.features.animatedIcon}](${fDocsUrl} '{lang:commands.information.sinfo.features.animatedIconDesc}')`,
		BANNER: `[{lang:commands.information.sinfo.features.banner}](${fDocsUrl} '{lang:commands.information.sinfo.features.bannerDesc}')`,
		WELCOME_SCREEN_ENABLED: `[{lang:commands.information.sinfo.features.welcomeScreen}](${fDocsUrl} '{lang:commands.information.sinfo.features.welcomeScreenDesc}')`,
		PUBLIC_DISABLED: `[{lang:commands.information.sinfo.features.publicDisabled}](${fDocsUrl} '{lang:commands.information.sinfo.features.publicDisabledDesc}')`
	};

	let features = msg.channel.guild.features.map(f => `\u25FD ${fStr[f] || `${f}`}`).join("\n");
	if (features === "") features = "\u25FD NONE";

	const verificationLevel = [
		"[{lang:commands.information.sinfo.verification.none}](https://furry.bot '{lang:commands.information.sinfo.verification.noneDesc}')",
		"[{lang:commands.information.sinfo.verification.low}](https://furry.bot '{lang:commands.information.sinfo.verification.lowDesc}')",
		"[{lang:commands.information.sinfo.verification.medium}](https://furry.bot '{lang:commands.information.sinfo.verification.mediumDesc}')",
		"[{lang:commands.information.sinfo.verification.high}](https://furry.bot '{lang:commands.information.sinfo.verification.highDesk}')",
		"[{lang:commands.information.sinfo.verification.veryHigh}](https://furry.bot '{lang:commands.information.sinfo.verification.veryHighDesc}')"
	];
	// let s;
	// if (msg.channel.guild.memberCount < 1000) s = await Promise.all(msg.guild.members.filter(m => !m.user.bot).map((m) => mdb.collection("users").findOne({ id: m.id }))).then(res => res.map(m => m === null ? config.defaults.userConfig : m).map(m => ({ owoCount: m.owoCount === undefined ? 0 : m.owoCount, uwuCount: m.uwuCount === undefined ? 0 : m.uwuCount })));
	// else s = false;
	const mfaLevel = [
		"{lang:commands.information.sinfo.mfa.notEnabled}",
		"{lang:commands.information.sinfo.mfa.enabled}"
	];

	const defaultNotifications = [
		"{lang:commands.information.sinfo.defaultNotifications.allMessages}",
		"{lang:commands.information.sinfo.defaultNotifications.onlyMentions}"
	];

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setTitle(`{lang:commands.information.sinfo.title} - **${msg.channel.guild.name}**`)
		.setTimestamp(new Date().toISOString())
		.setColor(Math.floor(Math.random() * 0xFFFFFF));

	if (msg.args.length === 0) embed.setDescription([
		`**{lang:commands.information.sinfo.server}**: \`${msg.prefix}sinfo server\``,
		`**{lang:commands.information.sinfo.members}**: \`${msg.prefix}sinfo members\``,
		`**{lang:commands.information.sinfo.channels}**: \`${msg.prefix}sinfo channels\``,
		`**{lang:commands.information.sinfo.icon}**: \`${msg.prefix}sinfo icon\``,
		`**{lang:commands.information.sinfo.banner}**: \`${msg.prefix}sinfo banner\``,
		`**{lang:commands.information.sinfo.splash}**: \`${msg.prefix}sinfo splash\``
	].join("\n"));
	else {
		switch (msg.args[0].toLowerCase()) {
			case "server": {
				embed
					.setDescription([
						`**{lang:commands.information.sinfo.server}**:`,
						`\u25FD {lang:commands.information.sinfo.name}: **${msg.channel.guild.name}**`,
						`\u25FD {lang:commands.information.sinfo.id}: **${msg.channel.guild.id}**`,
						`\u25FD {lang:commands.information.sinfo.owner}:** ${owner}**`,
						`\u25FD {lang:commands.information.sinfo.region}: **${msg.channel.guild.region}**`,
						`\u25FD {lang:commands.information.sinfo.creationDate}: **${Time.formatDateWithPadding(msg.channel.guild.createdAt, true)}**`,
						`\u25FD {lang:commands.information.sinfo.nitroBoosts}: **${msg.channel.guild.premiumSubscriptionCount || "None"}**`,
						`\u25FD {lang:commands.information.sinfo.boostTier}: **${msg.channel.guild.premiumTier || "None"}**`,
						`\u25FD {lang:commands.information.sinfo.large}: **${msg.channel.guild.large ? "{lang:commands.information.sinfo.yes}" : "{lang:commands.information.sinfo.no}"}**`,
						`\u25FD {lang:commands.information.sinfo.verificationLevel}: **${verificationLevel[msg.channel.guild.verificationLevel]}**`,
						`\u25FD {lang:commands.information.sinfo.2faRequirement}: **${mfaLevel[msg.channel.guild.mfaLevel]}**`,
						`\u25FD {lang:commands.information.sinfo.defaultNotificationsLabel}: **${defaultNotifications[msg.channel.guild.defaultNotifications]}**`,
						`\u25FD {lang:commands.information.sinfo.vanityUrl}: **${msg.channel.guild.features.includes("VANITY_URL") ? `[https://discord.gg/${msg.channel.guild.vanityURL}](https://discord.gg/${msg.channel.guild.vanityURL})` : "None"}**`,
						"",
						`**[{lang:commands.information.sinfo.featuresLabel}](${fDocsUrl})**:`,
						features
					].join("\n"))
					.setThumbnail(msg.channel.guild.iconURL);
				break;
			}
			case "members": {
				embed
					.setDescription([
						"**{lang:commands.information.sinfo.members}**:",
						`\u25FD {lang:commands.information.sinfo.total}: ${msg.channel.guild.memberCount} ([{lang:commands.information.sinfo.note}](https://botapi.furry.bot/note/sinfo '{lang:commands.information.sinfo.noteContent}'))`,
						`\u25FD <:${config.emojis.online}>: ${msg.channel.guild.members.filter(m => m.status === "online").length}`,
						`\u25FD <:${config.emojis.idle}>: ${msg.channel.guild.members.filter(m => m.status === "idle").length}`,
						`\u25FD <:${config.emojis.dnd}>: ${msg.channel.guild.members.filter(m => m.status === "dnd").length}`,
						`\u25FD <:${config.emojis.offline}>: ${msg.channel.guild.members.filter(m => m.status === "offline").length}`,
						`\u25FD {lang:commands.information.sinfo.nonBots}: ${msg.channel.guild.members.filter(m => !m.bot).length}`,
						`\u25FD {lang:commands.information.sinfo.bots}: ${msg.channel.guild.members.filter(m => m.bot).length}`
					].join("\n"))
					.setThumbnail(msg.channel.guild.iconURL);
				break;
			}

			case "channels": {
				embed
					.setDescription([
						"**{lang:commands.information.sinfo.channels}**:",
						`\u25FD {lang:commands.information.sinfo.total}: ${msg.channel.guild.channels.size}`,
						`\u25FD {lang:commands.information.sinfo.text}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT).length}`,
						`\u25FD {lang:commands.information.sinfo.voice}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_VOICE).length}`,
						`\u25FD {lang:commands.information.sinfo.category}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY).length}`,
						`\u25FD {lang:commands.information.sinfo.news}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_NEWS).length}`,
						`\u25FD {lang:commands.information.sinfo.store}: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_STORE).length}`,
						"",
						`\u25FD {lang:commands.information.sinfo.hiddenYou}: ${msg.channel.guild.channels.filter(c => !c.permissionsOf(msg.author.id).has("readMessages")).length}`,
						`\u25FD {lang:commands.information.sinfo.visibleYou}: ${msg.channel.guild.channels.filter(c => c.permissionsOf(msg.author.id).has("readMessages")).length}`,
						"",
						`\u25FD {lang:commands.information.sinfo.hiddenMe}: ${msg.channel.guild.channels.filter(c => !c.permissionsOf(this.user.id).has("readMessages")).length}`,
						`\u25FD {lang:commands.information.sinfo.visibleMe}: ${msg.channel.guild.channels.filter(c => c.permissionsOf(this.user.id).has("readMessages")).length}`
					].join("\n"))
					.setThumbnail(msg.channel.guild.iconURL);
				break;

			}

			case "icon": {
				embed
					.setImage(msg.channel.guild.iconURL)
					.setDescription([
						`**{lang:commands.information.sinfo.icon}**:`,
						`${[128, 256, 1024, 2048].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.iconURL.split("?")[0]}?size=${sz})`).join("  ")}`
					].join("\n"));
				break;
			}

			case "splash": {
				if (!msg.channel.guild.splashURL) return msg.reply("{lang:commands.information.sinfo.noSplash}");
				embed
					.setImage(msg.channel.guild.splashURL)
					.setDescription([
						`**{lang:commands.information.sinfo.splash}**:`,
						`${[128, 256, 1024, 2048].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.splashURL.split("?")[0]}?size=${sz})`).join("  ")}`
					].join("\n"));
				break;
			}

			case "banner": {
				if (!msg.channel.guild.bannerURL) return msg.reply("{lang:commands.information.sinfo.noBanner}");
				embed
					.setImage(msg.channel.guild.bannerURL)
					.setDescription([
						`**{lang:commands.information.sinfo.banner}**:`,
						`${[128, 256, 1024, 2048].map(sz => `[[${sz}x${sz}]](${msg.channel.guild.bannerURL.split("?")[0]}?size=${sz})`).join("  ")}`
					].join("\n"));
				break;
			}

			default: {
				return msg.reply("{lang:commands.information.sinfo.invalidType}");
			}
		}
	}
	return msg.channel.createMessage({
		embed
	});
}));
