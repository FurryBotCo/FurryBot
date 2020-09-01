import Command from "../../../util/cmd/Command";
import CommandError from "../../../util/cmd/CommandError";
import { Colors } from "../../../util/Constants";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Internal from "../../../util/Functions/Internal";
import Language from "../../../util/Language";
import FurryBotAPI from "../../../util/req/FurryBotAPI";

export default new Command(["kiss"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
			.setTimestamp(new Date().toISOString())
			.setFooter("\u200b", this.bot.user.avatarURL)
			.setColor(Colors.gold);

		if (msg.gConfig.settings.commandImages) {
			if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.permissionMissing", ["attachFiles"]));
			const img = await FurryBotAPI.furry.kiss("json", 1);
			embed.setImage(img.url);
		}
		return msg.channel.createMessage({
			embed: embed.toJSON()
		});
	});
