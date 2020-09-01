import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Request from "../../../util/Functions/Request";
import Language from "../../../util/Language";

export default new Command(["fox"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const img = await Request.getImageFromURL("https://foxrudor.de");
		if (!img) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.imageAPI"));
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setImage("attachment://fox.png")
					.toJSON()
		}, {
			file: img,
			name: "fox.png"
		});
	});
