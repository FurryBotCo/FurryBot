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
		"mock"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	description: "Mock some text",
	usage: "<text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.unparsedArgs.length < 1) return new Error("ERR_INVALID_USAGE");

	let embed: Eris.EmbedOptions = {
		title: "Mocking Text",
		description: functions.everyOtherUpper(msg.unparsedArgs.join(" ")),
		image: {
			url: "https://assets.furry.bot/mock.png"
		},
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		}
	};

	return msg.channel.createMessage({ embed });
}));