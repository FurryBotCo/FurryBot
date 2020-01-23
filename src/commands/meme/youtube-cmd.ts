import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"youtube"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2.5e3,
	donatorCooldown: 2e3,
	description: "Youtube comment",
	usage: "<text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	return GenericMemeCommand.handleText(this, msg, cmd.triggers[0], { avatars: [msg.author.avatarURL], usernames: [msg.author.username] });
}));
