import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import { Colors, ChannelNames } from "../../util/Constants";

export default new Command({
	triggers: [
		"inviteinfo",
		"invinfo"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	description: "Get info about a Discord invite.",
	usage: "<code>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const k = msg.unparsedArgs.join("").match(new RegExp("^((https?\:\/\/)?(discord\.gg|discordapp\.com\/invite)\/)?([A-Za-z0-9]{2,32})$", "i"));

	if (!k || k.length === 0) return msg.reply("I couldn't find an invite code in what you provided..");
	const code = k[4];

	if (!code) return msg.reply("I couldn't find an invite code in what you provided..");

	const inv = (await this.getInvite(code, true).catch(err => null)) as Eris.Invite & { channel: { type: number; }; guild: { vanityUrlCode?: string; }; };
	if (!inv) return msg.reply("that doesn't seem to be a valid invite code (or maybe I'm banned?).");
	const { guild, inviter, channel } = inv;

	const embed: Eris.EmbedOptions = {
		title: "Invite Info",
		color: Colors.green,
		author: {
			name: guild.name,
			icon_url: !guild.icon ? "https://i.furcdn.net/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
		},
		fields: [
			{
				name: "Server/Channel Info",
				value: [
					"Extra:",
					`\u25FD Code: [${inv.code}](https://discord.gg/${inv.code})`,
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
			}
		]
	};

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
	return msg.channel.createMessage({
		embed
	});
}));
