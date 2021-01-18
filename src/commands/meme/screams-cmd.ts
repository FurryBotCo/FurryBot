import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import Utility from "../../util/Functions/Utility";

export default new Command(["screams"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		let user1 = msg.author, user2 = msg.channel.guild.me.user;
		if (msg.args.length > 0) user2 = await msg.getUserFromArgs();
		if (!user2) return msg.reply({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});
		if (msg.args.length > 1) {
			// we assume they're providing a second user
			const s = await msg.getUserFromArgs(1, true, 1);
			if (s) {
				user1 = user2;
				user2 = s;
			}
		}
		const { ext, file } = await DankMemerAPI.screams([user1.avatarURL, user2.avatarURL]);
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
