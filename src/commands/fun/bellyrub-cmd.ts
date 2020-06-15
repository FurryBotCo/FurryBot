import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"bellyrub"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"attachFiles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
	const rand = msg.channel.guild.members.filter(m => m.id !== msg.author.id);
	const r = rand[Math.floor(Math.random() * rand.length)];
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.fun.bellyrub.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
			.setImage(config.images.bellyrub)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.toJSON()
	});
}));
