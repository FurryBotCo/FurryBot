import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Request, Utility } from "../../util/Functions";
import Logger from "../../util/LoggerV8";

export default new Command({
	triggers: [
		"fursuit"
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
	const img = await Request.imageAPIRequest(false, "fursuit", true, true);
	if (img.success === false) {
		this.log("error", img.error, `Shard #${msg.channel.guild.shard.id}`);
		return msg.reply(`{lang:other.error.imageAPI}`);
	}

	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";


	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`${extra}Short URL: <${short.link}>`)
			.setImage(img.response.image)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.setFooter("powered by furry.bot")
	});
}));
