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
		"content"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2e3,
	description: "Get the content types for our image types",
	usage: "",
	features: ["nsfw"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	const req = await phin({
		method: "GET",
		url: "https://api.furry.bot/counts",
		parse: "json",
		timeout: 5e3
	});
	let txt = "";
	const recurse = (obj, i, r) => new Promise(async (a, b) => Promise.all(Object.keys(obj).map(async (o) => typeof obj[o] !== "object" ? txt += `${r.repeat(i)}${o}: ${obj[o]}\n` : (txt += `${r.repeat(i)}${o}:\n`, recurse(obj[o] as {}, i + 1, r)))).then(a));
	await recurse(req.body, 0, "\t");
	return msg.channel.createMessage(txt);
}));
