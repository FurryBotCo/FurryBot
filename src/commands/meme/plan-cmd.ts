import Command from "../../modules/CommandHandler/Command";
import { DankMemerAPI } from "../../modules/External";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"plan"
	],
	permissions: {
		user: [],
		bot: [
			"attachFiles"
		]
	},
	cooldown: 2.5e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await DankMemerAPI.plan(Internal.memeParsing(msg, "using a meme command, not providing text, bot returns an error"));

	return msg.channel.createMessage("", {
		file: img.file,
		name: `${cmd.triggers[0]}.${img.ext}`
	});
}));
