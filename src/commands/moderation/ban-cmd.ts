import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"ban",
		"b"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 1e3,
	donatorCooldown: 1e3,
	description: "Ban members from your server.",
	usage: "<@member/id> [--days=<0-14>]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	let m, deleteDays = 0;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("days")) {
		deleteDays = Number(msg.dashedArgs.parsed.keyValue.days);
		if (deleteDays < 1) return msg.reply(`delete days cannot be less than zero.`);
		if (deleteDays > 14) return msg.reply(`delete days cannot be more than 14.`);
	}
	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) {
			const embed: Eris.EmbedOptions = {
				title: "User already banned",
				description: `It looks like ${user.username}#${user.discriminator} is already banned here..`,
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

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
	if (user.id === msg.guild.ownerID) return msg.reply("You cannot ban the server owner.");
	const a = Utility.compareMembers(user, msg.member);
	if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`You cannot ban ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if(!user.bannable) return msg.channel.createMessage(`<@!${msg.author.id}>, I cannot ban ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have ban permissions?`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were banned from **${msg.channel.guild.name}**\nReason: ${reason}`));
	user.ban(deleteDays, `Ban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
		if (!!msg.gConfig.settings.modlog) {
			if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
			else {
				const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
				if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
				else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
				else {
					await ch.createMessage({
						embed: {
							title: "Member Banned",
							description: [
								`Offender: ${user.username}#${user.discriminator} <@!${user.id}>`,
								`Reason: ${reason}`,
								`Message Delete Days: ${deleteDays}`
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
		msg.channel.createMessage(`I couldn't ban **${user.username}#${user.discriminator}**, ${err}`);
		if (typeof m !== "undefined") await m.delete();
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
