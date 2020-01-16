import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { Colors } from "../util/Constants";
import { Internal } from "../util/Functions";

export default new ClientEvent("guildCreate", (async function (this: FurryBot, guild: Eris.Guild) {
	this.increment([
		"events.guildCreate"
	]);

	await Internal.incrementDailyCounter(true);

	let author = {
		name: "Unknown#0000",
		icon_url: "https://i.furcdn.net/noicon.png"
	};
	let owner = "Unknown#0000 (000000000000000000)";
	if (guild.ownerID) {
		const u: Eris.User = await this.getRESTUser(guild.ownerID).catch(err => null);
		if (u !== null) {
			author = {
				name: `${u.username}#${u.discriminator}`,
				icon_url: u.avatarURL ? u.avatarURL : "https://i.furcdn.net/noicon.png"
			};
			owner = `${u.username}#${u.discriminator} (${u.id})`;
		}
	}


	Logger.info(`Shard #${guild.shard.id} | Client`, `Joined guild ${guild.name} (${guild.id}), owner: ${owner}, this guild has ${guild.memberCount} members! This guild has been placed on shard ${guild.shard.id}.`);
	const embed: Eris.EmbedOptions = {
		title: "Guild Joined!",
		description: [
			`Guild #${this.guilds.size}`,
			`Current Total: ${this.guilds.size}`,
			"",
			"**Guild Info**:",
			`${"\u25FD"} Name: ${guild.name}`,
			`${"\u25FD"} ID: ${guild.id}`,
			`${"\u25FD"} **Members**:`,
			`\t<:${config.emojis.online}>: ${guild.members.filter(m => m.status === "online").length}`,
			`\t<:${config.emojis.idle}>: ${guild.members.filter(m => m.status === "idle").length}`,
			`\t<:${config.emojis.dnd}>: ${guild.members.filter(m => m.status === "dnd").length}`,
			`\t<:${config.emojis.offline}>: ${guild.members.filter(m => m.status === "offline").length}`,
			`\t<:${config.emojis.bot}>: ${guild.members.filter(m => m.user.bot).length}`,
			`\t<:${config.emojis.human}>: ${guild.members.filter(m => !m.user.bot).length}`,
			`${"\u25FD"} Large: ${guild.large ? "Yes" : "No"} (${guild.memberCount})`,
			`${"\u25FD"} Owner: ${owner}`
		].join("\n"),
		author,
		image: {
			url: ![undefined, null, ""].includes(guild.iconURL) ? guild.iconURL : "https://i.furcdn.net/noicon.png"
		},
		thumbnail: {
			url: "https://i.furcdn.net/noicon.png"
		},
		timestamp: new Date().toISOString(),
		color: Colors.green,
		footer: {
			text: `Shard ${guild.shard.id + 1}/${this.shards.size}`,
			icon_url: "https://i.furry.bot/furry.png"
		}
	};

	if (embed.author.icon_url) embed.thumbnail.url = embed.author.icon_url;

	return this.executeWebhook(config.webhooks.guilds.id, config.webhooks.guilds.token, {
		embeds: [
			embed
		],
		username: `Furry Bot Guild Stats${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	}).catch(err => null);
}));
