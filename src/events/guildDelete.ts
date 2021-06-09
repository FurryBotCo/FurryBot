import FurryBot from "../main";
import config from "../config";
import db from "../db";
const { r: Redis } = db;
import { ClientEvent, Colors, defaultEmojis } from "core";
import Eris from "eris";
import Logger from "logger";

export default new ClientEvent<FurryBot>("guildDelete", async function (guild) {
	this.trackNoResponse("events", "guildDelete");
	const d = new Date();
	const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
	await Redis.decr(`stats:dailyJoins:${id}`);
	const st = await this.ipc.getStats();
	if (!("name" in guild)) {
		Logger.info([], `Left uncached guild "${guild.id}". We now have ${st.guilds - 1} guilds!`);
		return;
	}

	let author = {
		name: "Unknown#0000",
		icon_url: config.images.noIcon
	};
	let owner = "Unknown#0000 (000000000000000000)";
	if (guild.ownerID) {
		const u = await this.getUser(guild.ownerID).catch(() => null);
		if (u !== null) {
			author = {
				name: `${u.username}#${u.discriminator}`,
				icon_url: u.avatarURL ? u.avatarURL : config.images.noIcon
			};
			owner = `${u.username}#${u.discriminator} (${u.id})`;
		}
	}


	Logger.info([`Shard #${guild.shard.id}`, "Guild Leave"], `Left guild ${guild.name} (${guild.id}), owner: ${owner}, this guild had ${guild.memberCount} members! We now have ${st.guilds - 1} guilds!`);

	const embed: Eris.EmbedOptions = {
		title: "Guild Left!",
		description: [
			`Guild #${st.guilds + 1}`,
			`Current Total: ${st.guilds}`,
			"",
			"**Guild Info**:",
			`${defaultEmojis.dot} Name: ${guild.name}`,
			`${defaultEmojis.dot} ID: ${guild.id}`,
			`${defaultEmojis.dot} **Members**:`,
			`\t<:${config.emojis.status.online}>: ${guild.members.filter(m => m.status === "online").length}`,
			`\t<:${config.emojis.status.idle}>: ${guild.members.filter(m => m.status === "idle").length}`,
			`\t<:${config.emojis.status.dnd}>: ${guild.members.filter(m => m.status === "dnd").length}`,
			`\t<:${config.emojis.status.offline}>: ${guild.members.filter(m => m.status === "offline").length}`,
			`\t<:${config.emojis.custom.bot}>: ${guild.members.filter(m => m.user.bot).length}`,
			`\t${defaultEmojis.human}: ${guild.members.filter(m => !m.user.bot).length}`,
			`${defaultEmojis.dot} Large: ${guild.large ? "Yes" : "No"} (${guild.memberCount})`,
			`${defaultEmojis.dot} Owner: ${owner}`
		].join("\n"),
		author,
		image: {
			url: guild.iconURL ?? config.images.noIcon
		},
		thumbnail: {
			url: config.images.noIcon
		},
		timestamp: new Date().toISOString(),
		color: Colors.red,
		footer: {
			text: `Shard ${guild.shard.id + 1}/${st.shards.length}`,
			icon_url: this.bot.user.avatarURL
		}
	};

	if (embed.author && embed.author.icon_url) embed.thumbnail!.url = embed.author.icon_url;

	await this.w.get("guilds")!.execute({
		embeds: [
			embed
		]
	});
});
