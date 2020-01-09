import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

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
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Ban someone that isn't in your server.",
	usage: "<@user/id> [reason]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// get user from message
	let user: Eris.User;
	user = await msg.getUserFromArgs();

	if (!user) user = await this.getRESTUser(msg.args[0]).catch(err => null);
	if (!user) return msg.errorEmbed("INVALID_USER");

	if ((await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
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

	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	msg.channel.guild.banMember(user.id, 7, `Hackban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
		// msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "ban", userId: user.id, reason, timestamp: Date.now() }).then(() =>
		msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null)
		// )
	).catch(async (err) => {
		msg.channel.createMessage(`I couldn't hackban **${user.username}#${user.discriminator}**, ${err}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
