import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Request, Internal } from "../../util/Functions";
import Logger from "../../util/LoggerV8";
import Eris from "eris";

export default new Command({
	triggers: [
		"flop"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setAuthor(msg.author.tag, msg.author.avatarURL)
		.setDescription(`{lang:commands.fun.flop.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
		.setTimestamp(new Date().toISOString())
		.setColor(Math.floor(Math.random() * 0xFFFFFF));

	// unsure if V2 will have images for this
	/*if (gConfig.settings.commandImages) {
		if (!msg.channel.permissionsOf(this.user.id).has("attachFiles")) return msg.reply("{lang:other.error.permissionMissing|attachFiles}");
		const img = await Request.imageAPIRequest(false, "flop", true, true);
		if (img.success === false) {
			Logger.error(`Shard #${msg.channel.guild.shard.id}`, img.error);
			return msg.reply(`{lang:other.error.imageAPI}`);
		}
		embed.setImage(img.response.image);
	}*/
	return msg.channel.createMessage({
		embed
	});
}));
