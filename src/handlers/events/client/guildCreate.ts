import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import { Logger } from "@donovan_dmc/ws-clusters";

export default new ClientEvent("guildCreate", (async function (this: FurryBot, guild: Eris.Guild) {

	/* await this.track("clientEvent", "events.guildCreate", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		guild: {
			id: guild.id,
			name: guild.name,
			ownerId: guild.ownerID
		},
		guildCount: this.guilds.size
	}, new Date()); */

	await this.f.incrementDailyCounter(true, this.bot.guilds.size);

	let author = {
		name: "Unknown#0000",
		icon_url: "https://reddit.furry.host/noicon.png"
	};
	let owner = "Unknown#0000 (000000000000000000)";
	if (guild.ownerID) {
		const u: Eris.User = await this.bot.getRESTUser(guild.ownerID).catch(err => null);
		if (u !== null) {
			author = {
				name: `${u.username}#${u.discriminator}`,
				icon_url: u.avatarURL ? u.avatarURL : "https://reddit.furry.host/noicon.png"
			};
			owner = `${u.username}#${u.discriminator} (${u.id})`;
		}
	}


	Logger.info(`Joined guild ${guild.name} (${guild.id}), owner: ${owner}, this guild has ${guild.memberCount} members! This guild has been placed on shard ${guild.shard.id}.`, guild.shard.id);
	const embed: Eris.EmbedOptions = {
		title: "Guild Joined!",
		description: `Guild #${this.bot.guilds.size}\nCurrent Total: ${this.bot.guilds.size}`,
		author,
		image: {
			url: ![undefined, null, ""].includes(guild.iconURL) ? guild.iconURL : "https://reddit.furry.host/noicon.png"
		},
		thumbnail: {
			url: "https://reddit.furry.host/noicon.png"
		},
		fields: [
			{
				name: "Name",
				value: `${guild.name} (${guild.id})`,
				inline: false
			},
			{
				name: "Members",
				value: `Total: ${guild.memberCount}\n\n\
				<:online:590067324837691401>: ${guild.members.filter(m => m.status === "online").length}\n\
				<:idle:590067351806803968>: ${guild.members.filter(m => m.status === "idle").length}\n\
				<:dnd:590067389782032384>: ${guild.members.filter(m => m.status === "dnd").length}\n\
				<:offline:590067411080970241>: ${guild.members.filter(m => m.status === "offline").length}\n\n\
				Humans: ${guild.members.filter(m => !m.user.bot).length}\n
				Bots: ${guild.members.filter(m => m.user.bot).length}`,
				inline: false
			},
			{
				name: `Large Guild (${this.bot.options.largeThreshold}+ Members)`,
				value: guild.large ? `Yes (${guild.memberCount})` : `No ${guild.memberCount}`,
				inline: false
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: false
			}
		],
		timestamp: new Date().toISOString(),
		color: this.f.randomColor(),
		footer: {
			text: `Shard ${guild.shard.id + 1}/${this.cluster.maxShards}`,
			icon_url: "https://reddit.furry.host/FurryBotForDiscord.png"
		}
	};

	if (embed.author.icon_url) embed.thumbnail.url = embed.author.icon_url;

	return this.bot.executeWebhook(config.webhooks.guilds.id, config.webhooks.guilds.token, {
		embeds: [
			embed
		],
		username: `FurryBot Bot Guild Stats${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});
}));
