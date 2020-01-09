import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import Warning from "../../util/@types/Warning";

export default new Command({
	triggers: [
		"delwarn",
		"rmwarn"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Remove a warning from someone.",
	usage: "<@member/id> <warning id>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const id = msg.args[1];

	const w = await mdb.collection("warnings").findOne({
		guildId: msg.channel.guild.id,
		userId: member.id,
		id
	});

	if (!w) return msg.reply(`I couldn't find a warning for **${member.username}#${member.discriminator}** with the id "${id}" for this server.`);

	await mdb.collection("warnings").findOneAndDelete({
		guildId: msg.channel.guild.id,
		userId: member.id,
		id
	});

	return msg.reply(`deleted warning "${id}" for user **${member.username}#${member.discriminator}**.`);
}));
