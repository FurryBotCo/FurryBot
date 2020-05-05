import Command from "../../util/CommandHandler/lib/Command";
import * as Eris from "eris";

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
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.channel.edit({ topic: msg.unparsedArgs.join(" ") }, `Command: ${msg.author.username}#${msg.author.discriminator}`).then(async (c: Eris.TextChannel) => {
		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editChannel", edit: "topic", oldValue: o, newValue: c.topic, channelId: c.id, reason: "topic command", timestamp: Date.now() });
		return msg.channel.createMessage(`{lang:commands.utility.settopic.set|${c.id}|${!c.topic ? "{lang:commands.utility.settopic.none}" : c.topic}}`);
	});
}));
