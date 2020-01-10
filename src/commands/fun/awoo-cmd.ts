import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"awoo",
		"howl"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Start a howl, or join in!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.channel.awoo !== undefined && msg.channel.awoo.active) {
		if (msg.channel.awoo.inAwoo.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this awoo!`);
		clearTimeout(msg.channel.awoo.timeout);
		msg.channel.awoo.inAwoo.push(msg.author.id);
		const txt = "<:Awoo:596965580481888258>".repeat(msg.channel.awoo.inAwoo.length);
		msg.channel.createMessage(`<@!${msg.author.id}> joined a howl with ${msg.channel.awoo.inAwoo.length} furs!\nJoin in using \`${msg.gConfig.settings.prefix}awoo\`.\n${msg.channel.awoo.inAwoo.length > 30 ? "This howl is too large for emojis!" : txt}`);
		msg.channel.awoo.timeout = setTimeout((ch) => {
			delete ch.awoo;
		}, 3e5, msg.channel);
	} else {
		await msg.channel.createMessage(`<@!${msg.author.id}> started a howl!\nJoin in using \`${msg.gConfig.settings.prefix}awoo\`.\n<:Awoo:596965580481888258>`);
		msg.channel.awoo = {
			active: true,
			inAwoo: [],
			timeout: setTimeout((ch) => {
				delete ch.awoo;
			}, 3e5, msg.channel)
		};
		return msg.channel.awoo.inAwoo.push(msg.author.id);
	}
}));
