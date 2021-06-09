import FurryBot from "../main";
import config from "../config";
import db from "../db";
const { r: Redis } = db;
import { ClientEvent, Colors, defaultEmojis } from "core";
import Eris from "eris";
import Logger from "logger";

export default new ClientEvent<FurryBot>("guildCreate", async function (guild) {
	this.trackNoResponse("events", "guildCreate");
	const d = new Date();
	const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
	await Redis.incr(`stats:dailyJoins:${id}`);

	// wait to make sure invite has been processed, if it happened
	await new Promise(resolve => setTimeout(resolve, 3e3));
	const v = await Redis.get(`invites:${guild.id}`);
	let c: {
		inviter: string;
		inviterUser: Eris.User;
		permissions: number;
		source: string;
	} | undefined;
	if (v) {
		c = JSON.parse(v) as typeof c;
		c!.inviterUser = this.bot.users.get(c!.inviter)!;
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

	const st = await this.ipc.getStats();
	Logger.info([`Cluster #${this.cluster.id}`, `Shard #${guild.shard.id}`, "Guild Join"], `Joined guild ${guild.name} (${guild.id}), owner: ${owner}, this guild has ${guild.memberCount} members! This guild has been placed on shard ${guild.shard.id}. We now have ${st.guilds} guilds!`);
	const embed: Eris.EmbedOptions = {
		title: "Guild Joined!",
		description: [
			`Guild #${st.guilds + 1}`,
			`Current Total: ${st.guilds + 1}`,
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
			`${defaultEmojis.dot} Owner: ${owner}`,
			...(!c ?
				[] :
				[
					`${defaultEmojis.dot} Inviter: **${c.inviterUser?.tag || "Unknown#0000"}** (${c.inviter})`,
					`${defaultEmojis.dot} Permissions Provided: [${c.permissions}](https://discordapi.com/permissions.html#${c.permissions})`,
					`${defaultEmojis.dot} Source: **${c.source.toUpperCase()}**`
				]
			)
		].join("\n"),
		author,
		image: {
			url: guild.iconURL ?? config.images.noIcon
		},
		thumbnail: {
			url: config.images.noIcon
		},
		timestamp: new Date().toISOString(),
		color: Colors.green,
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
