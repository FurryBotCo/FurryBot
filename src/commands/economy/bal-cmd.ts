import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Colors } from "../../util/Constants";
import { db } from "../../modules/Database";

export default new Command({
	triggers: [
		"bal"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"externalEmojis"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Check your balance",
	usage: "[@user]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let member = msg.member;
	if (msg.args.length > 0) member = await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");
	const m = await db.getUser(member.id);
	return msg.channel.createMessage({
		embed: {
			title: member.id === msg.member.id ? "Your Balance" : `Balance of ${member.username}#${member.discriminator}`,
			color: Colors.gold,
			timestamp: new Date().toISOString(),
			description: `${m.bal}${msg.gConfig.settings.ecoEmoji}`,
			author: {
				name: `${member.username}#${member.discriminator}`,
				icon_url: member.avatarURL
			}
		}
	});
}));
