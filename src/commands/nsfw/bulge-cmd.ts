import Command from "../../util/CommandHandler/lib/Command";
import { Request, Utility } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"bulge",
		"bulgie"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: ["nsfw"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	// await msg.channel.startTyping();
	const img = await Request.imageAPIRequest(false, "bulge", true, false);
	if (img.success === false) {
		this.log("error", img, `Shard #${msg.channel.guild.shard.id}`);
		return msg.reply(`{lang:other.error.unknownAPIError|${img.error.code}|${img.error.description}}`);
	}
	const short = await Utility.shortenURL(img.response.image);
	const extra = short.new ? `{lang:other.firstTimeViewed|${short.linkNumber}}\n` : "";


	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setDescription(`${extra}{lang:other.shortURL}: <${short.link}>`)
			.setTitle("{lang:commands.nsfw.bulge.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setImage(img.response.image)
			.setFooter("{lang:other.poweredBy.furrybot}")
	});
}));
