import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"seen",
		"seenon"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get the servers we've seen a user on",
	usage: "[@user, or id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, a, b, guilds, fields: any[], embed: Eris.EmbedOptions, i;
	if (msg.args.length === 0 || !msg.args) {
		user = msg.member;
	} else {
		// get member from message
		user = await msg.getMemberFromArgs();
	}


	if (!user) return msg.errorEmbed("INVALID_USER");

	a = this.guilds.filter(g => g.members.has(user.id));
	b = a.map(g => `${g.name} (${g.id})`),
		guilds = [],
		fields = [],
		i = 0;
	for (const key in b) {
		if (!guilds[i]) guilds[i] = "";
		if (guilds[i].length > 1000 || +guilds[i].length + b[key].length > 1000) {
			i++;
			guilds[i] = b[key];
		} else {
			guilds[i] += `\n${b[key]}`;
		}
	}
	guilds.forEach((g, c) => {
		fields.push({
			name: `Server List #${+c + 1}`,
			value: g,
			inline: false
		});
	});
	embed = {
		title: `Seen On ${b.length} Servers - ${user.user.username}#${user.user.discriminator} (${user.id})`,
		description: `I see this user in ${guilds.size} other guilds.`,
		fields
	};
	msg.channel.createMessage({ embed });
}));