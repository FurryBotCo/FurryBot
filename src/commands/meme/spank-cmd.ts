import Command from "../../modules/CommandHandler/Command";
import { DankMemerAPI } from "../../modules/External";

export default new Command({
	triggers: [
		"spank"
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
	const member = msg.args.length === 0 ? msg.channel.guild.members.get(this.bot.user.id) : await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");
	const img = await DankMemerAPI.spank(member.id === this.bot.user.id ? [member.avatarURL, msg.author.avatarURL] : [msg.author.avatarURL, member.avatarURL]);

	return msg.channel.createMessage("", {
		file: img.file,
		name: `${cmd.triggers[0]}.${img.ext}`
	});
}));
