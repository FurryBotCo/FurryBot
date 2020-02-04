import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Colors } from "../../util/Constants";
import { db } from "../../modules/Database";

export default new Command({
	triggers: [
		"beg"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"externalEmojis"
	],
	cooldown: 6e4,
	donatorCooldown: 3e4,
	description: "Beg for money",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const names = [
		...config.eco.people,
		msg.channel.guild.members.random().username,
		msg.channel.guild.members.random().username,
		msg.channel.guild.members.random().username
	];

	const person = names[Math.floor(Math.random() * names.length)];

	const amount = Math.floor(Math.random() * 75) + 25;

	await msg.uConfig.edit({ bal: msg.uConfig.bal + amount });

	return msg.channel.createMessage({
		embed: {
			title: "Begging For Money",
			color: Colors.gold,
			timestamp: new Date().toISOString(),
			description: `**${person}** gave you ${amount}${msg.gConfig.settings.ecoEmoji}`,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});
}));
