import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Colors } from "../../util/Constants";
import { db } from "../../modules/Database";
import Logger from "../../util/LoggerV8";
import Economy from "../../util/Functions/Economy";

export default new Command({
	triggers: [
		"multiplier",
		"multi"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 1e4,
	donatorCooldown: .5e4,
	description: "Get your current economy multipliers",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const { multi, multiStr, list } = await Economy.calculateMulti(msg.author.id, this);

	// @TODO show non hidden multi with :x:
	return msg.channel.createMessage({
		embed: {
			color: Colors.green,
			title: "Multiplier",
			description: [
				...list.map(k => `${Economy.multi[k].name}: \`${parseFloat((Economy.multi[k].p * 100).toFixed(2))} %\``),
				"",
				`Total: \`${multiStr}%\``
			].join("\n"),
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});
}));
