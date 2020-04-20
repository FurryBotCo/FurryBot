import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";

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
	features: ["guildOwnerOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	msg.channel.createMessage("{lang:commands.utility.reset.confirm}");
	const d = await this.col.awaitMessage(msg.channel.id, msg.author.id, 6e4);
	if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("{lang:commands.utility.reset.invalid}");
	const choice = d.content.toLowerCase() === "yes";

	if (!choice) {
		return msg.channel.createMessage("{lang:commands.utility.reset.canceled}");
	} else {

		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "resetSettings", old: msg.gConfig, timestamp: Date.now() });
		await msg.channel.createMessage(`{lang:commands.utility.reset.done|${config.defaults.prefix}}`);
		try {
			await gConfig.reset().then(d => d.reload());
		} catch (e) {
			this.log("error", e, `Shard #${msg.channel.guild.shard.id}`);
			return msg.channel.createMessage("{lang:commands.utility.reset.error}");
		}
	}
}));
