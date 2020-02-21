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
	let multi = 0;
	const av: string[] = [];
	for (const k of Object.keys(Economy.multi)) {
		const m = Economy.multi[k];
		if (await m.check(msg.author.id, this)) {
			av.push(k);
			multi += m.p;
		}
	}

	// @TODO show non hidden multi with :x:
	return msg.channel.createMessage({
		embed: {
			color: Colors.green,
			title: "Multiplier",
			description: [
				...av.map(k => `${Economy.multi[k].name}: \`${parseFloat((Economy.multi[k].p * 100).toFixed(2))} %\``),
				"",
				`Total: \`${parseFloat((multi * 100).toFixed(2))}%\``
			].join("\n"),
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});
}));
