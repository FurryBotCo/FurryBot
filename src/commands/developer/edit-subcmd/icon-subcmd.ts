import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import ExtendedMessage from "@ExtendedMessage";
import phin from "phin";
import { Request } from "../../../util/Functions";

export default new SubCommand({
	triggers: [
		"icon"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check the bots icon.",
	usage: "<url>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
	const set = await phin({
		url: msg.unparsedArgs.join("%20"),
		timeout: 5e3
	}).then(res => `data:${res.headers["content-type"]};base64,${Buffer.from(res.body.toString()).toString("base64")}`);
	this.editSelf({ avatar: set })
		.then(async (user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set Avatar to (attachment)`, {
			file: await Request.getImageFromURL(user.avatarURL),
			name: "avatar.png"
		}))
		.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
}));
