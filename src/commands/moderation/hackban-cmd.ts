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
		"hackban",
		"hb"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 2.5e3,
	description: "Ban a person that isn't in your server",
	usage: "<@user/id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user: Eris.User, reason, embed, m;
	// get user from message
	user = await msg.getUserFromArgs();

	if (!user) user = await this.getRESTUser(msg.args[0]).catch(err => null);
	if (!user) return msg.errorEmbed("INVALID_USER");

	if ((await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
		embed = {
			title: "User already banned",
			description: `It looks like ${user.username}#${user.discriminator} is already banned here..`
		};
		Object.assign(embed, msg.embed_defaults());
		return msg.channel.createMessage({ embed });
	}

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
	reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	msg.channel.guild.banMember(user.id, 7, `Hackban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
		msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
	}).catch(async (err) => {
		msg.channel.createMessage(`I couldn't hackban **${user.username}#${user.discriminator}**, ${err}`);
		if (m !== undefined) {
			await m.delete();
		}
	});

	if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));