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
		"reset",
		"resetguild",
		"resetguildsettings"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 36e5,
	donatorCooldown: 36e5,
	description: "Reset the current servers settings.",
	usage: "",
	features: ["guildOwnerOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	msg.channel.createMessage("this will erase ALL guild (server) settings, are you sure you want to do this?\nType **yes** or **no**.");
	const d = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
	if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
	const choice = d.content.toLowerCase() === "yes";

	if (!choice) {
		return msg.channel.createMessage("Canceled reset.");
	} else {

		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "resetSettings", old: msg.gConfig, timestamp: Date.now() });
		await msg.channel.createMessage(`All guild settings will be reset shortly.\n(note: prefix will be **${config.defaultPrefix}**)`);
		try {
			await msg.gConfig.reset().then(d => d.reload());
		} catch (e) {
			Logger.error(e, msg.guild.shard.id);
			return msg.channel.createMessage("There was an internal error while doing this");
		}
	}
}));
