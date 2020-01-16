import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Time, Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"uinfo",
		"userinfo",
		"ui"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get some info about a user.",
	usage: "[@member/id]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const roles = user.roles.map(role => role !== msg.channel.guild.id ? `<@&${role}>` : "@everyone");

	const embed: Eris.EmbedOptions = {
		title: "User info",
		description: [
			`\u25FD Tag: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
			`\u25FD ID: ${user.id}`,
			`\u25FD Server Join Date: ${Time.formatDateWithPadding(user.joinedAt, true)}`,
			`\u25FD Account Creation Date: ${Time.formatDateWithPadding(user.createdAt, true)}`,
			`\u25FD Roles [${roles.length}]: ${roles.length > 15 ? `Too many roles to list, please use \`${msg.gConfig.settings.prefix}roles ${user.user.id}\`` : roles.length === 0 ? "NONE" : roles.toString()}`
		].join("\n")
	};

	if (!user.user.bot) {
		const u = await Internal.getUser(user.id);

		if (u.marriage.married) embed.fields.push({
			name: "Marriage Status (on this bot)",
			value: `Married to ${await this.getRESTUser(u.marriage.partner).then(usr => `${usr.username}#${usr.discriminator}`).catch(err => "Unknown#0000")}`,
			inline: true
		});

		else embed.fields.push({
			name: "Marriage Status (on this bot)",
			value: "Not Married.",
			inline: false
		});
	} else embed.fields.push({
		name: "Marriage Status (on this bot)",
		value: "Bots cannot be married.",
		inline: false
	});
	return msg.channel.createMessage({
		embed
	});
}));
