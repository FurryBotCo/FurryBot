import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"unban",
		"ub"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Remove bans for people that are already banned.",
	usage: "<id> [reason]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// get member from message
	if (!msg.args[0]) return msg.channel.createMessage("Please provide a user id.");

	const user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (!(await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
			const embed: Eris.EmbedOptions = {
				title: "User not banned",
				description: `It doesn't look like ${user.username}#${user.discriminator} is banned here..`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				color: Math.floor(Math.random() * 0xFFFFFF)
			};

			return msg.channel.createMessage({ embed });
		}
	}

	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***Unbanned ${user.username}#${user.discriminator}, ${reason}***`).catch(noerr => null);
		if (!!msg.gConfig.settings.modlog) {
			if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
			else {
				const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
				if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
				else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
				else {
					await ch.createMessage({
						embed: {
							title: "Member Unbanned",
							description: [
								`Offender: ${user.username}#${user.discriminator} <@!${user.id}>`,
								`Reason: ${reason}`
							].join("\n"),
							timestamp: new Date().toISOString(),
							color: Colors.red,
							author: {
								name: msg.channel.guild.name,
								icon_url: msg.channel.guild.iconURL
							},
							footer: {
								text: `Action carried out by ${msg.author.tag}`
							}
						}
					});
				}
			}
		}
	}).catch(async (err) => {
		msg.channel.createMessage(`I couldn't unban **${user.username}#${user.discriminator}**, ${err}`);
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
