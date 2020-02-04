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
	description: "WhY CaN'T YoU Be nOrMaL",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	// await msg.channel.startTyping();
	// await msg.channel.startTyping();
	const a = msg.args.shift();
	msg.args = ["https://i.furry.bot/furry.png"];
	return GenericMemeCommand.handleImage(this, msg, cmd.triggers[0], { avatars: [a || msg.author.avatarURL] });
}));
