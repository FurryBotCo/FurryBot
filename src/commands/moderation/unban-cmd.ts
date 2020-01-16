import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";

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
	msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
		// msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "unban", userId: user.id, reason, timestamp: Date.now() }).then(() =>
		msg.channel.createMessage(`***Unbanned ${user.username}#${user.discriminator}, ${reason}***`).catch(noerr => null)
		// )
	).catch(async (err) => {
		msg.channel.createMessage(`I couldn't unban **${user.username}#${user.discriminator}**, ${err}`);
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
