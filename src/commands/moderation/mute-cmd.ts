import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Utility, Time } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"mute",
		"m"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Stop someone from chatting.",
	usage: "<@member/id> [time] [reason]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let time = 0;
	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

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
			description: `The mute role specified for this server <@&${msg.gConfig.settings.muteRole}> (${msg.gConfig.settings.muteRole}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
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

	if (user.roles.includes(msg.gConfig.settings.muteRole)) return msg.channel.createMessage({
		embed: {
			title: "User already muted",
			description: `The user **${user.username}#${user.discriminator}** seems to already be muted.. You can unmute them with \`${msg.gConfig.settings.prefix}unmute @${user.username}#${user.discriminator} [reason]\``,
			color: 15601937,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});

	if (msg.args[1].match(/[0-9]{1,4}[ymdh]/i)) {
		const labels = {
			h: 3.6e+6,
			d: 8.64e+7,
			m: 2.628e+9,
			y: 3.154e+10
		};
		const t = Number(msg.args[1].slice(0, msg.args[1].length - 1).toLowerCase());
		const i = msg.args[1].slice(msg.args[1].length - 1).toLowerCase();
		if (t < 1) return msg.reply("time cannot be less than one (1).");
		if (!Object.keys(labels).includes(i)) return msg.reply("invalid time.");
		const a = [...msg.args];
		a.splice(1, 1);
		msg.args = a;
		time = labels[i] * t;
	}

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage(`${msg.author.id}>, Pretty sure you don't want to do this to yourself.`);
	const b = Utility.compareMembers(msg.member, user);
	if ((b.member2.higher || b.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if (user.permission.has("administrator")) return msg.channel.createMessage(`<@!${msg.author.id}>, That user has the \`ADMINISTRATOR\` permission, that would literally do nothing.`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";

	user.addRole(msg.gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was muted, ${reason}***`).catch(noerr => null);
		if (!!msg.gConfig.settings.modlog) {
			if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
			else {
				const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
				if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
				else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
				else {
					await ch.createMessage({
						embed: {
							title: "Member Muted",
							description: [
								`Target: ${user.username}#${user.discriminator} <@!${user.id}>`,
								`Reason: ${reason}`,
								`Time: ${time === 0 ? "Permanent" : Time.ms(time, true)}`
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
		if (time !== 0) await mdb.collection<GlobalTypes.TimedEntry>("timed").insertOne({
			time,
			expiry: Date.now() + time,
			userId: user.id,
			guildId: msg.channel.guild.id,
			type: "mute",
			reason
		});
	}).catch(async (err) => {
		msg.channel.createMessage(`<@!${msg.author.id}>, I couldn't mute **${user.username}#${user.discriminator}**, ${err}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
