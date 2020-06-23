import Command from "../../modules/CommandHandler/Command";
import { DankMemerAPI } from "../../modules/External";

export default new Command({
	triggers: [
		"presentation"
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
	let member = await msg.getMemberFromArgs();
	if (!member) member = msg.member;
	// @TODO not sure how to really internalize this one yet
	const img = await DankMemerAPI.quote(member.avatarURL, member.username, member.id === msg.author.id ? msg.args.join(" ") || "Provide Some Text." : msg.args.slice(1).join(" ") || "Provide Some Text.");

	return msg.channel.createMessage("", {
		file: img.file,
		name: `${cmd.triggers[0]}.${img.ext}`
	});
}));
