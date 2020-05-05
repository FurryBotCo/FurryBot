import Command from "../../util/CommandHandler/lib/Command";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"batslap"
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
	return GenericMemeCommand.handleImage(this, msg, uConfig, gConfig, "slap", { avatars: [a || msg.author.avatarURL] });
}));
