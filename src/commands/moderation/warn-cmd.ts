import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";
import { mdb } from "../../modules/Database";
import UserConfig from "../../modules/config/UserConfig";

export default new Command({
	triggers: [
		"warn",
		"w"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Warn a user for someting they've done",
	usage: "<@member/id> <reason>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, reason, w, u, embed, a;
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");
	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");
	u = await mdb.collection("users").findOne({ id: user.id }).then(res => new UserConfig(msg.author.id, res));
	a = functions.compareMembers(user, msg.member);
	if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
	if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID && !msg.user.isDeveloper) return msg.channel.createMessage(`You cannot warn ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	reason = msg.args.slice(1).join(" ");

	if (!reason) return msg.channel.createMessage("Please provide a reason.");

	w = await mdb.collection("users").findOneAndUpdate({ id: user.id }, { $push: { warnings: { wid: u.warnings.length + 1, blame: msg.author.id, reason, timestamp: Date.now(), gid: msg.channel.guild.id } } });
	if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
	embed = {
		title: `User Warned - #${u.warnings.length + 1}`,
		description: `User ${user.username}#${user.discriminator} was warned by ${msg.author.username}#${msg.author.discriminator}`,
		fields: [
			{
				name: "Reason",
				value: reason,
				inline: false
			}
		]
	};
	Object.assign(embed, msg.embed_defaults());
	return msg.channel.createMessage({ embed });
}));