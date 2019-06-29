import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"clearwarnings",
		"warnclear"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Clear warnings for a user",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, w, embed;
	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");
	w = await mdb.collection("users").findOneAndUpdate({ id: user.id }, { $pull: { warnings: { gid: msg.channel.guild.id } } });

	if (!w.ok) {
		embed = {
			title: "Failure",
			description: `Either you provided an invalid user, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has at least __*one*__ warning before using this.`,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	} else {
		embed = {
			title: "Success",
			description: `Cleared warnings for user **${user.username}#${user.discriminator}**.`,
			color: 41728
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}
}));