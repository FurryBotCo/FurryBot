import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import CommandError from "../../util/cmd/CommandError";
import Internal from "../../util/Functions/Internal";

export default new Command(["sword"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		let member = await msg.getMemberFromArgs();
		if (!member) member = msg.member
		else msg.args = msg.args.slice(1);
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);
		const { ext, file } = await DankMemerAPI.sword(member.nick || member.username, Internal.extraArgParsing(msg));
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
