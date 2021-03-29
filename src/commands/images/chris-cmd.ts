import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, EmbedBuilder } from "core";
import { Request } from "utilities";
import { JSONResponse } from "yiffy";
import { Redis } from "../../db";

export default new Command<FurryBot, UserConfig, GuildConfig>(["chris"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if(Redis === null) throw new TypeError("Redis is not ready.");
		const c = await Redis.get("chris");
		async function get(): Promise<JSONResponse> {
			const { images: [v] } = await Request.fetchURL("https://v2.yiff.rest/chris", false).then(v => JSON.parse(v.toString())) as { images: JSONResponse[]; };
			if (v.url === c) return get();
			else {
				await Redis!.set("chris", v.url);
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
				.setColor(Colors.furry)
				.setImage(img.url)
				.toJSON()
		});
	});
