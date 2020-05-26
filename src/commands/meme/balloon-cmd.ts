import Command from "../../modules/CommandHandler/Command";
import { DankMemerAPI } from "../../modules/External";

export default new Command({
	triggers: [
		"balloon"
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
	const img = await DankMemerAPI.balloon(msg.unparsedArgs.join(" ") || "Provide Some Text.");

	return msg.channel.createMessage("", {
		file: img.file,
		name: `${cmd.triggers[0]}.${img.ext}`
	});
}));
