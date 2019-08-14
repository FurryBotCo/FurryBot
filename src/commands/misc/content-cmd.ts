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
		"content"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Get the content count for the image types",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let req, counts, content;

	req = await phin({
		method: "GET",
		url: "https://api.furry.bot/counts"
	});
	counts = JSON.parse(req.body);

	// I know this is a mess, but I don't want to rewrite it right now
	// TODO: Make recursive function for this

	content = "";
	for (const category in counts) {
		content += `**${category}**\n`;
		if (counts[category] instanceof Object) {
			for (const level1 in counts[category]) {
				if (counts[category][level1] instanceof Object) {
					content += `\t${level1}:\n`;
					for (const level2 in counts[category][level1]) {
						if (counts[category][level1][level2] instanceof Object) {
							content += `\t\t${level2}:\n`;
							for (const level3 in counts[category][level1][level2]) content += `\t\t\t${level3}: ${counts[category][level1][level2][level3]}\n`;
						} else content += `\t\t${level2}: ${counts[category][level1][level2]}\n`;
					}
				} else content += `\t${level1}: ${counts[category][level1]}\n`;
			}
		}
	}
	return msg.channel.createMessage(content);
}));