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
		fields: [
			{
				name: "Tag",
				value: `${user.user.username}#${user.user.discriminator}`,
				inline: true
			}, {
				name: "User ID",
				value: user.id,
				inline: true
			}, {
				name: "Joined Server",
				value: new Date(user.joinedAt).toString().split("GMT")[0],
				inline: true
			}, {
				name: "Joined Discord",
				value: new Date(user.user.createdAt).toString().split("GMT")[0],
				inline: true
			}, {
				name: `Roles [${roles.length}]`,
				value: roles.length > 15 ? `Too many roles to list, please use \`${msg.gConfig.settings.prefix}roles ${user.user.id}\`` : roles.length === 0 ? "NONE" : roles.toString(),
				inline: false
			}
		]
	};

	if (!user.user.bot) {
		const u = await db.getUser(user.id);

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
