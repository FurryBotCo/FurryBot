import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import { mdb } from "../../modules/Database";
import chunk from "chunk";
import GuildConfig from "../../modules/config/GuildConfig";

export default new Command({
	triggers: [
		"lsar",
		"listselfassignableroles"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "List self assignable roles",
	usage: "[page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let roles, page, c, remove, rl, b, embed;
	roles = msg.gConfig.selfAssignableRoles;
	page = msg.args.length > 0 ? parseInt(msg.args[0], 10) : 1;
	if (roles.length === 0) return msg.reply("There are no roles set as self assignable.");
	c = chunk(roles, 10);
	if (c.length === 0) return msg.reply("There are no roles set as self assignable.");
	if (!page || page > c.length) return msg.reply("Invalid page.");
	remove = [];
	rl = roles.map(a => {
		b = msg.channel.guild.roles.get(a);
		if (!b) {
			remove.push(a);
			return `Role Not Found - \`${a}\``;
		}
		return b.name;
	}).join("\n");
	if (remove.length > 0) await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: { $each: remove } } });
	embed = {
		title: "Self Assignable Roles",
		description: `To gain a role, use the command \`${msg.gConfig.prefix}iam <role name>\`\nTo go to the next page, use \`${msg.gConfig.prefix}lsar [page]\`.\nPage ${page}/${c.length}`,
		fields: [
			{
				name: "Roles",
				value: rl,
				inline: false
			}
		]
	};
	Object.assign(embed, msg.embed_defaults());
	return msg.channel.createMessage({ embed });
}));