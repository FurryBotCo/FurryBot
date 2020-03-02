import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import Eris from "eris";

export default new Command({
	triggers: [
		"kick",
		"k"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [
		"kickMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Kick members from your server.",
	usage: "<@member/id> [reason]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	let m;
	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (user.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.reply("Pretty sure you don't want to do this to yourself.");
	const a = Utility.compareMembers(user, msg.member);
	if ((a.member2.higher || a.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot kick ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if(!user.kickable) return msg.channel.createMessage(`I cannot kick ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have kick permissions?`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were kicked from **${msg.channel.guild.name}**\nReason: ${reason}`));
	user.kick(`Kick: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was kicked, ${reason}***`).catch(noerr => null);
		if (!!msg.gConfig.settings.modlog) {
			if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
			else {
				const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
				if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
				else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
				else {
					await ch.createMessage({
						embed: {
							title: "Member Kicked",
							description: [
								`Target: ${user.username}#${user.discriminator} <@!${user.id}>`,
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
		await msg.reply(`I couldn't kick **${user.username}#${user.discriminator}**, ${err}`);
		if (m !== undefined) {
			await m.delete();
		}
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
