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
		"settopic",
		"st"
	],
	userPermissions: [
		"manageChannels"
	],
	botPermissions: [
		"manageChannels"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Set a text channel's topic",
	usage: "<topic>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const o = msg.channel.topic;
	return msg.channel.edit({ topic: msg.unparsedArgs.join(" ") }, `Command: ${msg.author.username}#${msg.author.discriminator}`).then(async (c: Eris.TextChannel) => {
		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editChannel", edit: "topic", oldValue: o, newValue: c.topic, channelId: c.id, reason: "topic command", timestamp: Date.now() });
		return msg.channel.createMessage(`Set the topic of <#${c.id}> to **${!c.topic ? "NONE" : c.topic}**`);
	});
}));
