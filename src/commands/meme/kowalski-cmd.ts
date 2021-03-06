import Command from "../../util/cmd/Command";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import CommandError from "../../util/cmd/CommandError";
import Internal from "../../util/Functions/Internal";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command(["kowalski"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);
		await msg.channel.startTyping();
		const { ext, file } = await DankMemerAPI.kowalski(Internal.extraArgParsing(msg));
		await msg.channel.stopTyping();
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("dankmemer.services", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.setImage(`attachment://${cmd.triggers[0]}.${ext}`)
				.toJSON()
		}, {
			name: `${cmd.triggers[0]}.${ext}`,
			file
		});
	});
