import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"leaveserver"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Make the bot leave a server (dev only)",
	usage: "[server id]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	// extra check, to be safe
	if (!config.developers.includes(msg.author.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot run this command as you are not a developer of this bot.`);
	let guild: Eris.Guild;

	if (msg.unparsedArgs.length === 0) guild = msg.guild;
	else {
		if (!this.guilds.has(msg.unparsedArgs[0])) {
			return msg.channel.createMessage(`<@!${msg.author.id}>, Guild not found`);
		}

		guild = this.guilds.get(msg.unparsedArgs[0]);
	}


	guild.leave().then(() => {
		return msg.channel.createMessage(`<@!${msg.author.id}>, Left guild **${guild.name}** (${guild.id})`);
	}).catch((err) => {
		return msg.channel.createMessage(`There was an error while doing this: ${err}`);
	});
}));