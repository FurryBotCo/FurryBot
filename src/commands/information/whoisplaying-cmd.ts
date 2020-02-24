import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"whoisplaying",
		"whosplaying"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a list of users playing the specified game",
	usage: "<game>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// debating a reaction menu
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const l = msg.channel.guild.members.filter(m => m.game && m.game.name.includes(msg.args.join(" ")));

	return msg.channel.createMessage({
		embed: {
			title: `Who Is Playing: "${msg.args.join(" ")}"`,
			timestamp: new Date().toISOString(),
			color: Colors.gold,
			description: [
				`Total: **${l.length}**`,
				"",
				...l.map(m => `${m.username}#${m.discriminator} (<@!${m.id}>)`)
			].join("\n"),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});
}));
