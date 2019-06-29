import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import UserConfig from "@modules/config/UserConfig";

export default new Command({
	triggers: [
		"fetchwarn",
		"fetchwarning"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Fetch a warning for a specific user",
	usage: "<@member/id> <warning id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");
	let user, w, embed, usr, blame;
	// get member from message
	user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");
	if (!msg.args[1]) return msg.reply("Please provide a valid warning id as the second argument.");

	w = await mdb.collection("users").findOne({ id: user.id }).then(res => new UserConfig(msg.author.id, res)).then(res => res.warnings.filter(w => w.wid === parseInt(msg.args[1], 10) && w.gid === msg.channel.guild.id)[0]);
	if (!w) {
		embed = {
			title: "Failure",
			description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has a warning with the id ${msg.args[1]}, and that the warning is for this server.\n\n(tip: to list warnings use \`${msg.gConfig.prefix}warnlog ${user.username}#${user.discriminator}\`)`,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	} else {
		usr = await this.getRESTUser(w.blame).catch(error => null);
		blame = !usr ? "Unknown#0000" : `${usr.username}#${usr.discriminator}`;
		embed = {
			title: `**${user.username}#${user.discriminator}** - Warning #${w.wid}`,
			description: `Blame: ${blame}\nReason: ${w.reason}\nTime: ${new Date(w.timestamp).toDateString()}`,
			color: 41728
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}
}));