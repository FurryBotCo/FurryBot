import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import { Utility, Request } from "../../util/Functions";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"fursuitbutts",
		"fursuitbutt"
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
	const img = await phin<any>({
		method: "GET",
		url: "https://api.fursuitbutts.com/butts",
		parse: "json",
		timeout: 5e3
	});

	if (img.statusCode !== 200) {
		this.log("error", img, `Shard #${msg.channel.guild.shard.id}`);
		return msg.reply(`{lang:other.error.unknownAPIError|${img.body.error.code}|${img.body.error.description}}`);
	}
	const short = await Utility.shortenURL(img.body.response.image);
	const extra = short.new ? `{lang:other.firstTimeViewed|${short.linkNumber}}\n` : "";

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setDescription(`${extra}{lang:other.shortURL}: <${short.link}>`)
			.setTitle("{lang:commands.nsfw.fursuitbutts.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setImage(img.body.response.image)
			.setFooter("{lang:other.poweredBy.furrybot}")
	});
}));
