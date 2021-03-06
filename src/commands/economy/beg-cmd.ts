import config from "../../config";
import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EconomyUtil from "../../util/EconomyUtil";
import EmbedBuilder from "../../util/EmbedBuilder";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["beg"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([
		"developer"
	])
	.setCooldown(6e4, false)
	.setDonatorCooldown(4.5e4)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		function r() {
			const p = msg.channel.guild.members.filter(m => !m.user.bot);
			return p[Math.floor(Math.random() * p.length)];
		}
		const people = [
			"built-in",
			r().username,
			r().username
		];
		let p = people[Math.floor(Math.random() * people.length)];
		if (p === "built-in") p = config.eco.people[Math.random() * config.eco.people.length];
		const a = Math.floor(Math.random() * (config.eco.amounts.beg.max - config.eco.amounts.beg.min)) + config.eco.amounts.beg.min;
		let item = "";
		const get = await EconomyUtil.shouldGetItem(msg.author.id);
		console.log("Getting Item:", get);
		if (get) {
			const t = EconomyUtil.calcItem("EPIC", msg.channel.nsfw);
			if (t) {
				item = `\n{lang:${cmd.lang}.item|${p}|<:${t.emoji}>|${Language.get(msg.gConfig.settings.lang, t.name)}}`;
				await EconomyUtil.addItemToUser(msg.author.id, t.id as any, 1);
			}
		}
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription([
						`{lang:${cmd.lang}.desc|${p}|${a}|${msg.gConfig.settings.ecoEmoji}}`,
						item
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Colors.gold)
					.toJSON()
		});
	});
