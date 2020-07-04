import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import CommandError from "../../modules/CommandHandler/CommandError";

// "browser": "Discord iOS",

export default new Command({
	triggers: [
		"gayrate"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const member = msg.args.length < 1 ? msg.member : await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.fun.gayrate.title|${member.username}#${member.discriminator}}`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.fun.gayrate.percent${member.id === msg.author.id ? "Self" : "Other"}|<@!${member.id}>|${Math.floor(Math.random() * 100)}}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.toJSON()
	});
}));
