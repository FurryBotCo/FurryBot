import FurryBot from "../../main";
import Language, { VALID_LANGUAGES } from "../Language";
import config from "../../config";
import Eris from "eris";
import { Colors, defaultEmojis, EmbedBuilder } from "core";

export default class TextHandler {
	private static handlers = {
		normalDM(client: FurryBot, lang: VALID_LANGUAGES) {
			const l = Language.get(lang, "other.dm.normal", [client.bot.user.username, defaultEmojis.dot, config.client.socials.discordInvite, config.client.socials.discord, config.client.socials.twitter, config.client.socials.website, config.defaults.prefix], false, false);
			return {
				embed: new EmbedBuilder(lang)
					.setTitle("{lang:other.dm.title}")
					.setDescription(typeof l === "string" ? l : l.join("\n"))
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString())
					.setFooter(`Hi ${defaultEmojis.wave}`, client.bot.user.avatarURL)
					.toJSON()
			} as Eris.MessageContent;
		},
		inviteDM(client: FurryBot, lang: VALID_LANGUAGES) {
			const l = Language.get(lang, "other.dm.invite", [config.client.socials.discordInvite, config.defaults.prefix, config.defaults.prefix], false, false);
			return {
				embed: new EmbedBuilder(lang)
					.setTitle("{lang:other.dm.title}")
					.setDescription(l.join("\n"))
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString())
					.setFooter(`Hi ${defaultEmojis.wave}`, client.bot.user.avatarURL)
					.toJSON()
			} as Eris.MessageContent;
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		voteDM: (client: FurryBot, lang: VALID_LANGUAGES) => ({} as Eris.MessageContent),
		mention: (client: FurryBot, lang: VALID_LANGUAGES, prefix: string, author: Eris.User) => ({
			embed: new EmbedBuilder(lang)
				.setTitle("{lang:other.mention.title}")
				.setDescription(`{lang:other.mention.desc|${author.username}|${prefix[0]}|${config.client.socials.discordInvite}|${config.client.socials.discord}}`)
				.setFooter("OwO", client.bot.user.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setAuthor(author.tag, author.avatarURL)
				.toJSON()
		})
	};

	static get<T extends keyof typeof TextHandler["handlers"]>(type: T, ...args: Parameters<typeof TextHandler["handlers"][T]>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.handlers[type](...args);
	}
}
