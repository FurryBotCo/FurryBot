import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"unmute",
		"um"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Remove a mute from someone.",
	usage: "<@member/id> [reason]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");

	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	// if(user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
	// if(user.roles.highest.rawPosition >= msg.member.roles.highest.rawPosition && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if(user.permissions.has("administrator")) return msg.channel.createMessage("That user has `ADMINISTRATOR`, that would literally do nothing.");
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (msg.gConfig.settings.muteRole === null) {
		const embed: Eris.EmbedOptions = {
			title: "No mute role",
			description: `this server does not have a mute role set, you can set this with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
			color: 15601937,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		};

		return msg.channel.createMessage({ embed });
	}
	if (!msg.channel.guild.roles.has(msg.gConfig.settings.muteRole)) {
		const embed: Eris.EmbedOptions = {
			title: "Mute role not found",
			description: `The mute role specified for this server <@&${msg.gConfig.settings.muteRole}> (${msg.channel.guild.id}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
			color: 15601937,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		};
		await msg.gConfig.edit({ settings: { muteRole: null } }).then(d => d.reload());

		return msg.channel.createMessage({ embed });
	}
	const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), msg.channel.guild.roles.get(msg.gConfig.settings.muteRole));
	if (a.same || a.lower) {
		const embed: Eris.EmbedOptions = {
			title: "Invalid mute role",
			description: `The current mute role <@&${msg.gConfig.settings.muteRole}> (${msg.gConfig.settings.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
			color: 15601937,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		};

		return msg.channel.createMessage({ embed });
	}

	if (!user.roles.includes(msg.gConfig.settings.muteRole)) {
		const embed: Eris.EmbedOptions = {
			title: "User not muted",
			description: `The user **${user.username}#${user.discriminator}** doesn't seem to be muted.. You can mute them with \`${msg.gConfig.settings.prefix}mute @${user.username}#${user.discriminator} [reason]\``,
			color: 15601937,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		};

		return msg.channel.createMessage({ embed });
	}

	user.removeRole(msg.gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was unmuted, ${reason}***`).catch(noerr => null);
		if (!!msg.gConfig.settings.modlog) {
			if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
			else {
				const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
				if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
				else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
				else {
					await ch.createMessage({
						embed: {
							title: "Member Unmuted",
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
		msg.channel.createMessage(`I couldn't unmute **${user.username}#${user.discriminator}**, ${err}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
