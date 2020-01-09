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
		"warn"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Add a warning to someone.",
	usage: "<@member/id> [reason]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const reason = msg.args.length > 1 ? msg.args.slice(1).join(" ") : "None Provided";

	await mdb.collection("warnings").insertOne({
		blameId: msg.author.id,
		guildId: msg.channel.guild.id,
		userId: member.id,
		id: this.f.random(7),
		reason,
		date: Date.now()
	} as Warning);


	await msg.channel.createMessage(`Warned user **${member.username}#${member.discriminator}**, *${reason}*`);

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
