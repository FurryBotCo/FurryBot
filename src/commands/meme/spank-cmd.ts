import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"spank"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2.5e3,
	donatorCooldown: 2e3,
	description: "Spank someone",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	let a = "https://i.furry.bot/furry.png";
	if (msg.args.length === 0) {
		a = msg.author.avatarURL;
		msg.args = ["https://i.furry.bot/furry.png"];
	} else {
		if (msg.mentions.length > 0 && msg.args[0].match(new RegExp(`<@!?${msg.mentions[0].id}>`))) {
			const u = msg.mentions.shift();
			msg.args = msg.args.slice(1);
			a = u.avatarURL;
		}
		msg.args = [msg.author.avatarURL];
	}
	return GenericMemeCommand.handleImage(this, msg, "spank", { avatars: [a || msg.author.avatarURL] });
}));
