import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

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
	cooldown: 2.5e3,
	description: "Remove a mute from someone",
	usage: "<@member/id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, embed, reason, a, m;
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");

	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	//if(user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
	//if(user.roles.highest.rawPosition >= msg.member.roles.highest.rawPosition && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	//if(user.permissions.has("administrator")) return msg.channel.createMessage("That user has `ADMINISTRATOR`, that would literally do nothing.");
	reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (msg.gConfig.muteRole === null) {
		embed = {
			title: "No mute role",
			description: `this server does not have a mute role set, you can set this with \`${msg.gConfig.prefix}setmuterole <role>\``,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}
	if (!msg.channel.guild.roles.has(msg.gConfig.muteRole)) {
		embed = {
			title: "Mute role not found",
			description: `The mute role specified for this server <@&${msg.gConfig.muteRole}> (${msg.channel.guild.id}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.prefix}setmuterole <role>\``,
			color: 15601937
		};
		await msg.gConfig.edit({ muteRole: null }).then(d => d.reload());
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}
	a = functions.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), msg.channel.guild.roles.get(msg.gConfig.muteRole));
	if (a.higher || a.same) {
		embed = {
			title: "Invalid mute role",
			description: `The current mute role <@&${msg.gConfig.muteRole}> (${msg.gConfig.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${msg.gConfig.prefix}setmuterole <role>\``,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}

	if (!user.roles.includes(msg.gConfig.muteRole)) {
		embed = {
			title: "User not muted",
			description: `The user **${user.username}#${user.discriminator}** doesn't seem to be muted.. You can mute them with \`${msg.gConfig.prefix}mute @${user.username}#${user.discriminator} [reason]\``,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}

	user.removeRole(msg.gConfig.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
		msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was unmuted, ${reason}***`).catch(noerr => null);
	}).catch(async (err) => {
		msg.channel.createMessage(`I couldn't unmute **${user.username}#${user.discriminator}**, ${err}`);
		if (m !== undefined) {
			await m.delete();
		}
	});
	if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));