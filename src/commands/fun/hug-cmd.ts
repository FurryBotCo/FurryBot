import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Internal } from "../../util/Functions";
import { FurryBotAPI } from "../../modules/External";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"hug"
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
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setAuthor(msg.author.tag, msg.author.avatarURL)
		.setDescription(`{lang:commands.fun.hug.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
		.setTimestamp(new Date().toISOString())
		.setColor(Math.floor(Math.random() * 0xFFFFFF));

	if (gConfig.settings.commandImages) {
		if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.reply("{lang:other.errors.permissionMissing|attachFiles}");
		const img = await FurryBotAPI.furry.hug("json", 1);
		embed.setImage(img.url);
	}
	return msg.channel.createMessage({
		embed: embed.toJSON()
	});
}));
