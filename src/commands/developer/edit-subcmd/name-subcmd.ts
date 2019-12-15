import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"name",
		"username"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Change the bots username.",
	usage: "<username>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
	const username = msg.unparsedArgs.join(" ");
	if (username.length < 2 || username.length > 32) return msg.channel.createMessage("Username must be between **2** and **32** characters.");
	this.editSelf({ username })
		.then((user) => msg.reply(`set username to "${user.username}"`))
		.catch((err) => msg.reply(`there was an error while doing this: ${err}`));
}));
