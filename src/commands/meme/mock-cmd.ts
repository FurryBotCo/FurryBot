import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
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
}, (async function (this: FurryBot, msg: ExtendedMessage) {
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
