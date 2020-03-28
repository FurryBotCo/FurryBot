import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"screams"
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
	// await msg.channel.startTyping();
	const a = msg.args.shift();
	msg.args = ["https://i.furry.bot/furry.png"];
	return GenericMemeCommand.handleImage(this, msg, uConfig, gConfig, cmd.triggers[0], { avatars: [a || msg.author.avatarURL] });
}));
