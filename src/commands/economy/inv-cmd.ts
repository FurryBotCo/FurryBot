import config from "../../config";
import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EconomyUtil from "../../util/EconomyUtil";
import EmbedBuilder from "../../util/EmbedBuilder";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";
import chunk from "chunk";

export default new Command(["inv", "inventory"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([
		"developer"
	])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		let pArg = 0, mArg = 0;
		if (msg.args.length === 0) {
			pArg = null;
			mArg = null;
		} else if (msg.args.length === 1) {
			if (!isNaN(Number(msg.args[0])) && !/[0-9]{15,21}/.test(msg.args[0])) {
				pArg = 0;
				mArg = null;
			} else if (/(<@!?)?[0-9]{15,21}>?/.test(msg.args[0])) {
				pArg = 1;
				mArg = 0;
			}
		} else {
			pArg = 1;
			mArg = 0;
		}
		const member = mArg === null ? msg.member : await msg.getMemberFromArgs(mArg, true, 0);
		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});
		const user = member.id === msg.author.id ? msg.uConfig : await db.getUser(member.id);

		const j: string[] = [];
		if (!user.eco || !(user.eco.inv instanceof Array)) await user.mongoEdit({
			$set: {
				"eco.inv": []
			}
		});
		if (user.eco.inv.length === 0) return msg.reply({
			content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.empty${member.id === msg.author.id ? "Self" : "Other"}`, [`<@!${member.id}>`]),
			allowedMentions: {
				users: [
					msg.author.id
				]
			}
		});
		for (const { id, amount } of user.eco.inv) {
			const { emoji, emojiAlt, name, rarity, description } = config.eco.items[id] || {
				emoji: null,
				name: "other.economy.items.unknown.name",
				rarity: "unknown",
				description: "other.economy.items.unknown.description"
			};
			j.push(
				`${emoji === null ? config.emojis.default.questionMark : `<:${msg.channel.nsfw && id === "knot" ? emojiAlt : emoji}>`} **{lang:${name}}** ─ ${amount}`,
				`ID: ${id} ─ **{lang:other.economy.rarities.${rarity}}** {lang:other.words.item$ucwords$}`,
				`{lang:other.words.description$ucwords$}: {lang:${description}}`,
				""
			);
		}
		// 4 of [text, text, text, empty]
		const items = chunk(j, 16);
		const page = !msg.args[pArg] ? 1 : Number(msg.args[pArg]);
		if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.oneOrMore`));
		if (page > items.length) return msg.reply({
			content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.tooManyPages${member.id === msg.author.id ? "Self" : "Other"}`, [`<@!${member.id}>`, items.length, items.length === 1 ? "" : "s"]),
			allowedMentions: {
				users: [
					msg.author.id
				]
			}
		});

		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTitle(`{lang:${cmd.lang}.title${member.id === msg.author.id ? "Self" : "Other"}|${member.username}}`)
					.setDescription(items[page - 1].join("\n"))
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Colors.gold)
					.toJSON()
		});
	});
