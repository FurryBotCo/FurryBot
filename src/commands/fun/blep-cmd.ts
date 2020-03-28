import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Request, Internal } from "../../util/Functions";
import Logger from "../../util/LoggerV8";

export default new Command({
	triggers: [
		"blep"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await Request.imageAPIRequest(true, "blep");
	if (img.success === false) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, img.error);
		return msg.reply(`{lang:other.error.imageAPI}`);
	}

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:commands.fun.blep.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
			.setImage(img.response.image)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
	});
}));
