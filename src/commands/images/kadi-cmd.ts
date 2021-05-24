import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, EmbedBuilder } from "core";
import { Request } from "utilities";
import { Redis } from "../../db";

export default new Command<FurryBot, UserConfig, GuildConfig>(["kadi"], __filename)
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
		const c = await Redis.get("kadi");
		async function get(): Promise<string> {
			const v = await Request.fetchURL("https://api.floofy.dev/kadi", false).then(v => JSON.parse(v.toString())) as { url: string; };
			if (v.url === c) return get();
			else {
				await Redis!.set("kadi", v.url);
				return v.url;
			}
		}
		const img = await get();
		if (!img) throw new TypeError(`No image was returned.`);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.client.user.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setDescription([
				`[{lang:${cmd.lang}.inc}](https://discord.gg/eCXqpQR)`,
					"",
					`{lang:other.words.title$ucwords$}: ${img.split("/").slice(-1)[0].split(".").slice(0, -1).join(".")}`
				].join("\n"))
				.setColor(Colors.furry)
				.setImage(img)
				.toJSON()
		});
	});
