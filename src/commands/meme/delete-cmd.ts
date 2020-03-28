import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"delete"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2.5e3,
	donatorCooldown: 2e3,
	description: "Delete this garbage",
	usage: "[image/@user]",
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	// await msg.channel.startTyping();
	return GenericMemeCommand.handleImage(this, msg, uConfig, gConfig, cmd.triggers[0]);
}));
