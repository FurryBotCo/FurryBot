import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../modules/Database";
import Eris from "eris";
import phin from "phin";

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
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
	const set = await phin({ url: msg.unparsedArgs.join("%20"), parse: "none" }).then(res => `data:${res.headers["content-type"]};base64,${res.body.toString("base64")}`);
	this.editSelf({ avatar: set })
		.then(async (user) => msg.channel.createMessage(`<@!${msg.author.id}>, Set Avatar to (attachment)`, {
			file: await this.f.getImageFromURL(user.avatarURL),
			name: "avatar.png"
		}))
		.catch((err) => msg.channel.createMessage(`There was an error while doing this: ${err}`));
}));
