import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import { Colors, ChannelNames } from "../../util/Constants";
import BigInt from "big-integer";

export default new Command({
	triggers: [
		"lookup"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	description: "Lookup a Discord server by its id.",
	usage: "<id>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const w = await phin({
		method: "GET",
		url: `https://discordapp.com/api/guilds/${msg.args[0]}/widget.json`,
		headers: {
			"Authorization": `Bot ${config.bot.token}`,
			"User-Agent": config.web.userAgent
		},
		parse: "json"
	});

	switch (w.statusCode) {
		case 200:
			const embed: Eris.EmbedOptions = {
				title: "Server Found",
				description: `A server with the id "${msg.args[0]}" was found.`,
				color: Colors.green,
				timestamp: new Date().toISOString(),
				fields: []
			};

			const code = w.body.instant_invite.match(new RegExp("^((https?\:\/\/)?(discord\.gg|discordapp\.com\/invite)\/)?([A-Za-z0-9]{2,32})$", "i"))[4];
			const inv = (await this.getInvite(code, true).catch(err => null)) as Eris.Invite & { channel: { type: number; }; guild: { vanityUrlCode?: string; }; };
			if (!inv) {
				embed.fields.push({
					name: "Info",
					value: [
						`\u25FD Server Name: ${w.body.name}`,
						`\u25FD Creation Date: ${this.f.formatDateWithPadding(new Date(BigInt(w.body.id).divide("4194304").add("1420070400000").toJSNumber()), true)}`,
						`\u25FD Online/Idle/DnD Members: ${w.body.presence_count}`,
						`\t<:${config.emojis.online}> ${w.body.members.filter(m => m.status === "online").length}`,
						`\t<:${config.emojis.idle}> ${w.body.members.filter(m => m.status === "idle").length}`,
						`\t<:${config.emojis.dnd}> ${w.body.members.filter(m => m.status === "dnd").length}`
					].join("\n"),
					inline: false
				});
			} else {
				const { guild, inviter, channel } = inv;
				embed.fields.push({
					name: "Server/Channel Info",
					value: [
						"Extra:",
						`\u25FD Invite Code: [${inv.code}](https://discord.gg/${inv.code})`,
						"",
						"**Server**:",
						`\u25FD Server Name: [${guild.name}](https://discord.gg/${inv.code})`,
						`\u25FD Server ID: ${guild.id}`,
						`\u25FD Member Count: ${inv.memberCount || "Unknown"}`,
						`\u25FD Presence Count: ${inv.presenceCount || "Unknown"}`,
						`\u25FD Vanity URL Code: ${inv.guild.vanityUrlCode || "None"}`,
						"",
						"Channel:",
						`\u25FD Channel Name: ${channel.name}`,
						`\u25FD Channel ID: ${channel.id}`,
						`\u25FD Channel Type: ${ChannelNames[channel.type]}`
					].join("\n"),
					inline: false
				});

				if (!!inviter) {
					embed.fields.push({
						name: "Inviter",
						value: [
							`Name: ${inviter.username}#${inviter.discriminator}`,
							`ID: ${inviter.id}`,
							`Bot: ${inviter.bot ? "Yes" : "No"}`,
							`System: ${inviter.system ? "Yes" : "No"}`
						].join("\n"),
						inline: false
					});
					embed.thumbnail = { url: inviter.avatarURL };
				}

				embed.author = {
					name: guild.name,
					icon_url: !guild.icon ? "https://i.furcdn.net/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
				};
			}

			return msg.channel.createMessage({
				embed
			});
			break;

		case 403:
			return msg.channel.createMessage({
				embed: {
					title: "Server Found",
					description: `A server with the id "${msg.args[0]}" was found. No further info available.`,
					color: Colors.orange,
					timestamp: new Date().toISOString()
				}
			});
			break;

		case 404:
			return msg.channel.createMessage({
				embed: {
					title: "Server Not Found",
					description: `A server with the id "${msg.args[0]}" was not found.`,
					color: Colors.red,
					timestamp: new Date().toISOString()
				}
			});
			break;

		default:
			console.log(w.body);
			return msg.channel.createMessage({
				embed: {
					title: "Discord Error",
					description: `Unknown Discord error encountered: ${w.statusCode} ${w.statusMessage}`
				}
			});
	}
}));
