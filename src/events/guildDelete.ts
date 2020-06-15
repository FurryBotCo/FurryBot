import ClientEvent from "../util/ClientEvent";
import Logger from "../util/LoggerV9";
import FurryBot from "../main";
import config from "../config";
import { Colors } from "../util/Constants";
import Eris from "eris";
import { Internal } from "../util/Functions";

export default new ClientEvent("guildDelete", (async function (this: FurryBot, guild: Eris.Guild) {
	await this.track("events", "guildDelete");
	await Internal.incrementDailyCounter(false);

	let author = {
		name: "Unknown#0000",
		icon_url: config.images.noIcon
	};
	let owner = "Unknown#0000 (000000000000000000)";
	if (guild.ownerID) {
		const u: Eris.User = await this.bot.getRESTUser(guild.ownerID).catch(err => null);
		if (u !== null) {
			author = {
				name: `${u.username}#${u.discriminator}`,
				icon_url: u.avatarURL ? u.avatarURL : config.images.noIcon
			};
			owner = `${u.username}#${u.discriminator} (${u.id})`;
		}
	}


	this.log("info", `Left guild ${guild.name} (${guild.id}), owner: ${owner}, this guild had ${guild.memberCount} members! We now have ${this.bot.guilds.size} guilds.`, `Shard #${guild.shard.id} | Client`);
	const embed: Eris.EmbedOptions = {
		title: "Guild Left!",
		description: [
			`Guild #${this.bot.guilds.size + 1}`,
			`Current Total: ${this.bot.guilds.size}`,
			"",
			"**Guild Info**:",
			`${"\u25FD"} Name: ${guild.name}`,
			`${"\u25FD"} ID: ${guild.id}`,
			`${"\u25FD"} **Members**:`,
			`\t${config.emojis.online}: ${guild.members.filter(m => m.status === "online").length}`,
			`\t${config.emojis.idle}: ${guild.members.filter(m => m.status === "idle").length}`,
			`\t${config.emojis.dnd}: ${guild.members.filter(m => m.status === "dnd").length}`,
			`\t${config.emojis.offline}: ${guild.members.filter(m => m.status === "offline").length}`,
			`\t${config.emojis.bot}: ${guild.members.filter(m => m.user.bot).length}`,
			`\t${config.emojis.human}: ${guild.members.filter(m => !m.user.bot).length}`,
			`${"\u25FD"} Large: ${guild.large ? "Yes" : "No"} (${guild.memberCount})`,
			`${"\u25FD"} Owner: ${owner}`
		].join("\n"),
		author,
		image: {
			url: ![undefined, null, ""].includes(guild.iconURL) ? guild.iconURL : config.images.noIcon
		},
		thumbnail: {
			url: config.images.noIcon
		},
		timestamp: new Date().toISOString(),
		color: Colors.red,
		footer: {
			text: `Shard ${guild.shard.id + 1}/${this.bot.shards.size}`,
			icon_url: config.images.botIcon
		}
	};

	if (embed.author.icon_url) embed.thumbnail.url = embed.author.icon_url;

	return this.bot.executeWebhook(config.webhooks.guilds.id, config.webhooks.guilds.token, {
		embeds: [
			embed
		],
		username: `Furry Bot Guild Stats${config.beta ? " - Beta" : ""}`,
		avatarURL: config.images.botIcon
	}).catch(err => null);
}));
