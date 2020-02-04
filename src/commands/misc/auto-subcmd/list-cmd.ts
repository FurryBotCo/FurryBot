import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Colors } from "../../../util/Constants";

export default new SubCommand({
	triggers: [
		"list"
	],
	userPermissions: [
		"manageChannels",
		"manageGuild"
	],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "List automated postings",
	usage: "",
	features: ["premiumGuildOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: SubCommand) {
	return msg.channel.createMessage({
		embed: {
			title: "Auto Status",
			description: [
				"**Yiff**:",
				`\u25FD `
			].join("\n"),
			color: Colors.gold,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});
}));
