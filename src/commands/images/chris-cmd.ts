import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { JSONResponse } from "furrybotapi/src/typings";
import Request from "../../util/Functions/Request";
import Redis from "../../util/Redis";

export default new Command(["chris"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const c = await Redis.get("chris");
		async function get() {
			const { images: [v] } = await Request.fetchURL("https://api.furry.bot/V2/chris", false).then(v => JSON.parse(v.toString())) as { images: JSONResponse[]; };
			if (v.url === c) return get();
			else {
				await Redis.set("chris", v.url);
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
					`[[{lang:other.images.shortURL}]](${img.shortURL})`,
					`[[{lang:other.images.reportURL}]](${img.reportURL})`,
					`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
				].join("\n"))
				.setColor(Colors.gold)
				.setImage(img.url)
				.toJSON()
		});
	});
