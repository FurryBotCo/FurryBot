import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

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
	description: "Ban members from your server",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	let user, embed, reason, m;
	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
		if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) {
			embed = {
				title: "User already banned",
				description: `It looks like ${user.username}#${user.discriminator} is already banned here..`
			};
			Object.assign(embed, msg.embed_defaults());
			return msg.channel.createMessage({ embed });
		}
	}

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
	if (user.id === msg.guild.ownerID) return msg.reply("You cannot ban the server owner.");
	const a = functions.compareMembers(user, msg.member);
	if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`You cannot ban ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if(!user.bannable) return msg.channel.createMessage(`<@!${msg.author.id}>, I cannot ban ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have ban permissions?`);
	reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were banned from **${msg.channel.guild.name}**\nReason: ${reason}`));
	user.ban(1, user.id, `Ban: ${msg.author.username}#${user.discriminator} -> ${reason}`).then(() => {
		msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
	}).catch(async (err) => {
		msg.channel.createMessage(`I couldn't ban **${user.username}#${user.discriminator}**, ${err}`);
		if (m !== undefined) {
			await m.delete();
		}
	});
	if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));