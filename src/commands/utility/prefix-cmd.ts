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
		"prefix"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "List this servers prefix, or change my prefix for this server.",
	usage: "[new prefix]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) return msg.channel.createMessage(`This servers prefix is "${msg.gConfig.settings.prefix}", if you want to change this, run this again with the new prefix! (ex: ${msg.gConfig.settings.prefix}prefix <new prefix>)`);
	if (msg.args.join("").toLowerCase() === msg.gConfig.settings.prefix.toLowerCase()) return msg.reply("that is already this servers prefix.");
	if ([`<@!${this.user.id}>`, `<@${this.user.id}>`].some(t => msg.args.join("").toLowerCase() === t.toLowerCase())) return msg.reply(`you cannot use ${msg.args.join("").toLowerCase()} as my prefix.`);
	if (msg.args.join("").length > 15) return msg.reply("the maximum length for my prefix is 15 characters (not counting spaces).");
	const o = msg.gConfig.settings.prefix;
	await msg.gConfig.edit({ settings: { prefix: msg.args.join("").toLowerCase() } }).then(d => d.reload());
	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: "prefix", oldValue: o, newValue: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" "), timestamp: Date.now() });
	return msg.reply(`set this servers prefix to ${msg.args.join("").toLowerCase()}`);
}));
