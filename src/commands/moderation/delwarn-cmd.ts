import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"delwarn",
		"rmwarn"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Delete a users warning",
	usage: "<@member/id> <wid>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");
	let user, w, embed;
	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (!msg.args[1]) return msg.reply("Please provide a valid warning id as the second argument.");

	w = await mdb.collection("users").findOneAndUpdate({ id: user.id }, { $pull: { warnings: { wid: parseInt(msg.args[1], 10), gid: msg.channel.guild.id } } });
	if (!w.ok) {
		embed = {
			title: "Failure",
			description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has a warning with the id ${msg.args[1]}.`,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	} else {
		embed = {
			title: "Success",
			description: `Deleted warning #${msg.args[1]} for user **${user.username}#${user.discriminator}**.`,
			color: 41728
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}
}));