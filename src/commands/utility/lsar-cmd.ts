import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import chunk from "chunk";

export default new Command({
	triggers: [
		"lsar",
		"listselfassignableroles"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	description: "List this servers self assignable roles.",
	usage: "[page]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const roles = msg.gConfig.selfAssignableRoles;
	const page = msg.args.length > 0 ? parseInt(msg.args[0], 10) : 1;
	if (roles.length === 0) return msg.reply("There are no roles set as self assignable.");
	const c = chunk(roles, 10);
	if (c.length === 0) return msg.reply("There are no roles set as self assignable.");
	if (!page || page > c.length) return msg.reply("Invalid page.");
	const remove = [];
	const rl = roles.map(a => {
		const b = msg.channel.guild.roles.get(a);
		if (!b) {
			remove.push(a);
			return `Role Not Found - \`${a}\``;
		}
		return b.name;
	}).join("\n");
	if (remove.length > 0) await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: { $each: remove } } });
	const embed: Eris.EmbedOptions = {
		title: "Self Assignable Roles",
		description: `To gain a role, use the command \`${msg.gConfig.settings.prefix}iam <role name>\`\nTo go to the next page, use \`${msg.gConfig.settings.prefix}lsar [page]\`.\nPage ${page}/${c.length}`,
		fields: [
			{
				name: "Roles",
				value: rl,
				inline: false
			}
		],
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		timestamp: new Date().toISOString(),
		color: Math.floor(Math.random() * 0xFFFFFF)
	};

	return msg.channel.createMessage({ embed });
}));
