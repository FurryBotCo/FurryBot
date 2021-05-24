import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["bed"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		let user1 = msg.author, user2: Eris.User | null = msg.channel.guild.me.user;
		if (msg.args.length > 0) user2 = await msg.getUserFromArgs();
		if (!user2) return msg.reply({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});
		if (msg.args.length > 1) {
			// we assume they're providing a second user
			const s = await msg.getUserFromArgs(1, true, 1);
			if (s) {
				user1 = user2;
				user2 = s;
			}
		}
		const { ext, file } = await DankMemerAPI.bed([user1.avatarURL, user2.avatarURL]);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("dankmemer.services", this.client.user.avatarURL)
				.setColor(Colors.furry)
				.setImage(`attachment://${cmd.triggers[0]}.${ext}`)
				.toJSON()
		}, {
			name: `${cmd.triggers[0]}.${ext}`,
			file
		});
	});
