import { ClientEvent } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";

export default new ClientEvent<FurryBot>("guildDelete", (async function (this: FurryBot, guild: Eris.Guild) {
	const c = await this.cluster.evalAtManager("this.clusters.size");
	const gc = c.response === 1 ? this.bot.guilds.size : await this.cluster.getManagerStats().then(c => c.guildCount);
	await this.f.incrementDailyCounter(false, gc);


	await this.a.track("guildDelete", {
		clusterId: this.cluster.id,
		shardId: guild.shard.id,
		guildId: guild.id,
		guildOwner: guild.ownerID,
		total: gc,
		members: {
			total: guild.memberCount,
			online: guild.members.filter(m => m.status === "online").length,
			idle: guild.members.filter(m => m.status === "idle").length,
			dnd: guild.members.filter(m => m.status === "dnd").length,
			offline: guild.members.filter(m => m.status === "offline").length,
			bots: guild.members.filter(m => m.bot).length
		},
		timestamp: Date.now()
	});

	let author = {
		name: "Unknown#0000",
		icon_url: "https://i.furcdn.net/noicon.png"
	};
	let owner = "Unknown#0000 (000000000000000000)";
	if (guild.ownerID) {
		const u: Eris.User = await this.bot.getRESTUser(guild.ownerID).catch(err => null);
		if (u !== null) {
			author = {
				name: `${u.username}#${u.discriminator}`,
				icon_url: u.avatarURL ? u.avatarURL : "https://i.furcdn.net/noicon.png"
			};
			owner = `${u.username}#${u.discriminator} (${u.id})`;
		}
	}

	Logger.info(`Cluster #${this.cluster.id} | Shard #${guild.shard.id} | Client`, `Left guild ${guild.name} (${guild.id}), owner: ${owner}, this guild had ${guild.memberCount} members.`);

	const embed: Eris.EmbedOptions = {
		title: "Guild Left!",
		description: `Guild #${gc + 1}\nCurrent Total: ${gc}`,
		author,
		image: {
			url: ![undefined, null, ""].includes(guild.iconURL) ? guild.iconURL : "https://i.furcdn.net/noicon.png"
		},
		thumbnail: {
			url: "https://i.furcdn.net/noicon.png"
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
			icon_url: "https://i.furry.bot/furry.png"
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
