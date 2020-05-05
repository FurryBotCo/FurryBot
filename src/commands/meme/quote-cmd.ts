import Command from "../../util/CommandHandler/lib/Command";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"quote"
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
	let avatar = msg.author.avatarURL,
		username = msg.author.username;
	if (msg.mentions.length > 0 && msg.args[0].match(new RegExp(`<@!?${msg.mentions[0].id}>`))) {
		msg.args = msg.args.slice(1);
		const k = msg.mentions.shift();
		avatar = k.avatarURL;
		username = k.username;
	}
	return GenericMemeCommand.handleText(this, msg, uConfig, gConfig, cmd.triggers[0], { avatars: [avatar], usernames: [username] });
}));
