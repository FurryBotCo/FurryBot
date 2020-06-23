import Command from "../../modules/CommandHandler/Command";
import { DankMemerAPI } from "../../modules/External";

export default new Command({
	triggers: [
		"satan"
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
	const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");
	const img = await DankMemerAPI.satan(member.avatarURL);

	return msg.channel.createMessage("", {
		file: img.file,
		name: `${cmd.triggers[0]}.${img.ext}`
	});
}));
