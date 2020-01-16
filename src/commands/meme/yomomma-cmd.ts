import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Request } from "../../util/Functions";
export default new Command({
	triggers: [
		"yomomma"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Get a yomomma joke",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	const txt = await Request.memeRequest("/yomomma");
	const embed: Eris.EmbedOptions = {
		title: "YoMomma Joke",
		description: JSON.parse(txt.body.toString()).text,
		footer: {
			text: "provided by dankmemer.services"
		}
	};
	return msg.channel.createMessage({ embed });
}));
