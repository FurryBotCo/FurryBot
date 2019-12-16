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
		"spacify"
	],
	userPermissions: [
		"manageChannels"
	],
	botPermissions: [
		"manageChannels"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Replaces dashes with 'spaces' in channel names.",
	usage: "<channel>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	const ch = await msg.getChannelFromArgs();
	if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
	if (ch.name.indexOf("-") === -1) return msg.channel.createMessage("Channel name contains no dashes (-) to replace.");
	const o = ch.name;
	await ch.edit({
		name: ch.name.replace(/-/g, "\u2009\u2009")
	}, `${msg.author.username}#${msg.author.discriminator}: Spacify ${ch.name}`);
	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editChannel", edit: "name", oldValue: o, newValue: ch.name, channelId: ch.id, reason: "spacify command", timestamp: Date.now() });
	return msg.channel.createMessage(`Spacified <#${ch.id}>!`);
}));
