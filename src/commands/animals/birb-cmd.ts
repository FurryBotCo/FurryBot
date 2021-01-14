import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Yiffy from "../../util/req/Yiffy";

export default new Command(["birb", "bird"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await Yiffy.animals.birb("json", 1);
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription(`[{lang:other.words.imageURL}](${img.url})`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setImage(img.url)
					.toJSON()
		});
	});
