import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"reset",
		"resetguild",
		"resetsettings",
		"resetguildsettings"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 36e5,
	description: "Reset guild settings",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let choice;
	msg.channel.createMessage("this will erase ALL guild (server) settings, are you sure you want to do this?\nType **yes** or **no**.");
	const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
	if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
	choice = d.content.toLowerCase() === "yes" ? true : false;
	if (!choice) {
		return msg.channel.createMessage("Canceled reset.");
	} else {
		await msg.channel.createMessage(`All guild settings will be reset shortly.\n(note: prefix will be **${config.defaultPrefix}**)`);
		try {
			await msg.gConfig.reset().then(d => d.reload());
		} catch (e) {
			this.logger.error(e);
			return msg.channel.createMessage("There was an internal error while doing this");
		}
	}
	return;
}));