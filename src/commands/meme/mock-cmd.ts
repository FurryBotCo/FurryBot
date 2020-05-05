import Command from "../../util/CommandHandler/lib/Command";
import * as Eris from "eris";
import { Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"mock"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.unparsedArgs.length < 1) throw new Error("ERR_INVALID_USAGE");

	const embed: Eris.EmbedOptions = {
		title: "Mocking Text",
		description: Strings.everyOtherUpper(msg.unparsedArgs.join(" ").toLowerCase()),
		image: {
			url: "https://assets.furry.bot/mock.png"
		},
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		}
	};

	return msg.channel.createMessage({ embed });
}));
