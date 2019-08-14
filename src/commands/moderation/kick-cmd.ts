import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

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
	cooldown: 2e3,
	description: "Kick members from your server",
	usage: "<@member/id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	let user, reason, m, a;
	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
	a = functions.compareMembers(user, msg.member);
	if ((a.member2.higher || a.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot kick ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if(!user.kickable) return msg.channel.createMessage(`I cannot kick ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have kick permissions?`);
	reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were kicked from **${msg.channel.guild.name}**\nReason: ${reason}`));
	user.kick(`Kick: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
		msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was kicked, ${reason}***`).catch(noerr => null);
	}).catch(async (err) => {
		await msg.reply(`I couldn't kick **${user.username}#${user.discriminator}**, ${err}`);
		if (m !== undefined) {
			await m.delete();
		}
	});

	if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));