import Command from "../../util/CommandHandler/lib/Command";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"stroke"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2.5e3,
	donatorCooldown: 2e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	// await msg.channel.startTyping();
	return GenericMemeCommand.handleText(this, msg, uConfig, gConfig, cmd.triggers[0]);
}));
