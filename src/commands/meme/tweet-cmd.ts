import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import { BotFunctions, Colors, Command, CommandError, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["tweet"], __filename)
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
		if (!member) member = msg.member;
		else msg.args = msg.args.slice(1);
		if (msg.args.length === 0) return new CommandError("INVALID_USAGE", cmd);
		const { ext, file } = await DankMemerAPI.tweet(member.avatarURL, [member.nick || member.username, member.username], BotFunctions.memeArgParsing(msg));
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("dankmemer.services", this.bot.user.avatarURL)
				.setColor(Colors.furry)
				.setImage(`attachment://${cmd.triggers[0]}.${ext}`)
				.toJSON()
		}, {
			name: `${cmd.triggers[0]}.${ext}`,
			file
		});
	});
