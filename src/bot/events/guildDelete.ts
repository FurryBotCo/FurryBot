import ClientEvent from "../../util/ClientEvent";
import { Colors } from "../../util/Constants";
import config from "../../config";
import Eris from "eris";
import Logger from "../../util/Logger";

export default new ClientEvent("guildDelete", async function (guild) {
	await this.sh.track("events", "guildDelete");

	let author = {
		name: "Unknown#0000",
		icon_url: "https://i.furcdn.net/noicon.png"
	};
	let owner = "Unknown#0000 (000000000000000000)";
	if (guild.ownerID) {
		const u: Eris.User = await this.getUser(guild.ownerID).catch(err => null);
		if (u !== null) {
			author = {
				name: `${u.username}#${u.discriminator}`,
				icon_url: u.avatarURL ? u.avatarURL : "https://i.furcdn.net/noicon.png"
			};
			owner = `${u.username}#${u.discriminator} (${u.id})`;
		}
	}

	const st = await this.ipc.getStats();

	Logger.info([`Cluster #${this.cluster.id}`, `Shard #${guild.shard.id}`, "Guild Leave"], `Left guild ${guild.name} (${guild.id}), owner: ${owner}, this guild had ${guild.memberCount} members! We now have ${st.guilds - 1} guilds!`);

	const embed: Eris.EmbedOptions = {
		title: "Guild Left!",
		description: [
			`Guild #${st.guilds + 1}`,
			`Current Total: ${st.guilds}`,
			"",
			"**Guild Info**:",
			`${config.emojis.default.dot} Name: ${guild.name}`,
			`${config.emojis.default.dot} ID: ${guild.id}`,
			`${config.emojis.default.dot} **Members**:`,
			`\t<:${config.emojis.status.online}>: ${guild.members.filter(m => m.status === "online").length}`,
			`\t<:${config.emojis.status.idle}>: ${guild.members.filter(m => m.status === "idle").length}`,
			`\t<:${config.emojis.status.dnd}>: ${guild.members.filter(m => m.status === "dnd").length}`,
			`\t<:${config.emojis.status.offline}>: ${guild.members.filter(m => m.status === "offline").length}`,
			`\t<:${config.emojis.custom.bot}>: ${guild.members.filter(m => m.user.bot).length}`,
			`\t<:${config.emojis.default.human}>: ${guild.members.filter(m => !m.user.bot).length}`,
			`${config.emojis.default.dot} Large: ${guild.large ? "Yes" : "No"} (${guild.memberCount})`,
			`${config.emojis.default.dot} Owner: ${owner}`
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
			text: `Shard ${guild.shard.id + 1}/${st.shards.size}`,
			icon_url: this.bot.user.avatarURL
		}
	};

	if (embed.author.icon_url) embed.thumbnail.url = embed.author.icon_url;

	return this.bot.executeWebhook(config.webhooks.guilds.id, config.webhooks.guilds.token, {
		embeds: [
			embed
		]
	}).catch(err => null);
});
