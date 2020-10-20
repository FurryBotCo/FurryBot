import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { JSONResponse } from "furrybotapi/src/typings";
import Request from "../../util/Functions/Request";
import Redis from "../../util/Redis";

export default new Command(["kadi"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const c = await Redis.get("kadi");
		async function get() {
			const v = await Request.fetchURL("https://api.augu.dev/kadi", false).then(v => JSON.parse(v.toString()).url) as string;
			if (v === c) return get();
			else {
				await Redis.set("kadi", v);
				return v;
			}
		}
		const img = await get();
		if (!img) throw new TypeError(`No image was returned.`);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.bot.user.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setDescription([
					`[{lang:${cmd.lang}.inc}](https://discord.gg/eCXqpQR)`,
					"",
					`{lang:other.words.title$ucwords$}: ${img.split("/").slice(-1)[0].split(".").slice(0, -1).join(".")}`
				].join("\n"))
				.setColor(Colors.gold)
				.setImage(img)
				.toJSON()
		});
	});
